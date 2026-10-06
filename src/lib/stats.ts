// The figures behind the Stats page. Pure functions: the page reads the files,
// this adds them up.

import { readTallies, type SourceTally } from './sources';

/** Tokens spent with one model. */
export interface ModelTokens {
  model: string;
  input: number;
  output: number;
  /** One total across several models. */
  combined?: boolean;
}

/**
 * The name of the row for tokens an early run recorded as one total across
 * several models: it names them, since the total cannot be divided.
 */
export const combined = (models: string[]) => (models.length ? `${[...models].sort().join(' and ')}, combined` : 'Model not recorded');

/** What the page needs from one pipeline run, with anything an older run left out counted as nothing. */
export interface Run {
  /** The edition the run wrote into. */
  date: string;
  /** When it ran. Noon on the edition day for an early run that did not say. */
  ranAt: string;
  /** Articles the model reviewed. */
  assessed: number;
  /** What became of them. Runs from before these were recorded count each as nothing. */
  published: number;
  belowThreshold: number;
  /** How many of those below the threshold were close enough to be printed in brief. */
  briefs: number;
  notRelevant: number;
  invalid: number;
  tokens: ModelTokens[];
  /** What the provider said the run cost, in US dollars. Left out when it did not say. */
  cost?: number;
  /** What the run recorded about each source, by source id. Empty for runs from before this was kept. */
  sources: Record<string, SourceTally>;
}

const number = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/** A run's tokens by model. Runs before this was recorded give one total and a list of models. */
function tokensOf(raw: Record<string, unknown>): ModelTokens[] {
  if (raw.tokensByModel && typeof raw.tokensByModel === 'object') {
    return Object.entries(raw.tokensByModel as Record<string, { input?: unknown; output?: unknown }>).map(([model, spent]) => ({
      model,
      input: number(spent?.input),
      output: number(spent?.output),
    }));
  }
  const input = number(raw.inputTokens);
  const output = number(raw.outputTokens);
  if (input + output === 0) return [];
  const models = Array.isArray(raw.models) ? raw.models.filter((m): m is string => typeof m === 'string') : [];
  // With one model the total is that model's. With several it cannot be divided, and is not guessed.
  return models.length === 1 ? [{ model: models[0], input, output }] : [{ model: combined(models), input, output, combined: true }];
}

/** The lines of `data/stats.jsonl`. A line that is not a run is skipped. */
export function parseRuns(text: string): Run[] {
  const runs: Run[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }
    if (!raw || typeof raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) continue;
    runs.push({
      date: raw.date,
      ranAt: typeof raw.ranAt === 'string' && !Number.isNaN(Date.parse(raw.ranAt)) ? raw.ranAt : `${raw.date}T12:00:00Z`,
      assessed: number(raw.assessed),
      published: number(raw.published),
      belowThreshold: number(raw.belowThreshold),
      // Never more than fell below the threshold, whatever the line says.
      briefs: Math.min(number(raw.briefs), number(raw.belowThreshold)),
      notRelevant: number(raw.notRelevant),
      invalid: number(raw.invalidReplies),
      tokens: tokensOf(raw),
      sources: readTallies(raw.sources),
      // Nought is a cost too: a run on a free model. Only a run that was told nothing has none.
      ...(typeof raw.costUsd === 'number' && Number.isFinite(raw.costUsd) && raw.costUsd >= 0 ? { cost: raw.costUsd } : {}),
    });
  }
  return runs;
}

export interface Count {
  label: string;
  count: number;
}

/** How often each value occurs, most frequent first, then by name. */
export function tally(values: string[]): Count[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export interface Totals {
  assessed: number;
  published: number;
  belowThreshold: number;
  briefs: number;
  notRelevant: number;
  invalid: number;
  /** In US dollars, or undefined unless every run that used tokens recorded its cost. */
  cost?: number;
  inputTokens: number;
  outputTokens: number;
  /** Heaviest first, with any combined rows last. */
  tokens: ModelTokens[];
}

/** Runs added together. */
export function totalRuns(runs: Run[]): Totals {
  const byModel = new Map<string, ModelTokens>();
  for (const spent of runs.flatMap((run) => run.tokens)) {
    const row = byModel.get(spent.model) ?? { ...spent, input: 0, output: 0 };
    row.input += spent.input;
    row.output += spent.output;
    byModel.set(spent.model, row);
  }
  const tokens = [...byModel.values()]
    .filter((row) => row.input + row.output > 0)
    .sort((a, b) => Number(a.combined ?? false) - Number(b.combined ?? false) || b.input + b.output - (a.input + a.output) || a.model.localeCompare(b.model));
  const sum = (pick: (run: Run) => number) => runs.reduce((total, run) => total + pick(run), 0);
  const spending = runs.filter((run) => run.tokens.length > 0);
  const costed = spending.length > 0 && spending.every((run) => run.cost !== undefined);
  return {
    assessed: sum((run) => run.assessed),
    published: sum((run) => run.published),
    belowThreshold: sum((run) => run.belowThreshold),
    briefs: sum((run) => run.briefs),
    notRelevant: sum((run) => run.notRelevant),
    invalid: sum((run) => run.invalid),
    ...(costed ? { cost: sum((run) => run.cost ?? 0) } : {}),
    inputTokens: tokens.reduce((total, row) => total + row.input, 0),
    outputTokens: tokens.reduce((total, row) => total + row.output, 0),
    tokens,
  };
}

/** One part of a divided bar. `tone` picks its shade: the part the bar is about, or one of the rest. */
export interface Part extends Count {
  tone: 'main' | 'light' | 'rest' | 'faint' | 'unknown';
}

/**
 * What became of the articles reviewed, as the parts of one bar. Anything the
 * runs did not account for, as with runs from before outcomes were recorded,
 * is its own part, so the bar always adds up to the articles reviewed.
 */
export function outcomes(totals: Totals): Part[] {
  const known = totals.published + totals.belowThreshold + totals.notRelevant + totals.invalid;
  const parts: Part[] = [
    { label: 'Published', count: totals.published, tone: 'main' },
    // A close call that was printed in brief is shown as that, and not with the rest that fell short.
    { label: 'Printed in brief', count: totals.briefs, tone: 'light' },
    { label: 'Below the score bar', count: totals.belowThreshold - totals.briefs, tone: 'rest' },
    { label: 'Not relevant', count: totals.notRelevant, tone: 'faint' },
    { label: 'Unusable reply', count: totals.invalid, tone: 'unknown' },
    { label: 'Not recorded', count: Math.max(0, totals.assessed - known), tone: 'unknown' },
  ];
  return parts.filter((part) => part.count > 0);
}

/** `part` as a whole-number percentage of `whole`. */
export const share = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** Tokens spent on each edition, oldest first. */
export function tokensByDay(runs: Run[]): Count[] {
  const days = new Map<string, number>();
  for (const run of runs) {
    const spent = run.tokens.reduce((total, row) => total + row.input + row.output, 0);
    if (spent > 0) days.set(run.date, (days.get(run.date) ?? 0) + spent);
  }
  return [...days.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));
}

/** Whether a day ("2026-10-04") falls in a month ("2026-10"). */
export const inMonth = (day: string, month: string) => day.slice(0, 7) === month;

/** 1049638 as "1,049,638". */
export const formatNumber = (n: number) => new Intl.NumberFormat('en-GB').format(n);

/** 284362 as "284K", for a label with little room. */
export const compact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

/** 0.0747 as "$0.07", and 0.0032 as "$0.003": cents, or the first figure that is not nought. */
export const formatCost = (usd: number) => `$${usd >= 0.01 ? usd.toFixed(2) : usd.toPrecision(1)}`;
