// What a run of the pipeline leaves behind for the Logs page, which is for
// whoever runs the paper and exists only on their machine. Pure functions: the
// pipeline writes these, the page reads them.

import { jsonLines } from './jsonl';

export type ArticleOutcome = 'published' | 'held' | 'below-threshold' | 'not-relevant' | 'dropped' | 'invalid-reply' | 'deferred';

export const OUTCOME_LABELS: Record<ArticleOutcome, string> = {
  published: 'Published',
  held: 'Held for a quieter day',
  'below-threshold': 'Below the score threshold',
  'not-relevant': 'Not relevant',
  dropped: 'Dropped before review',
  'invalid-reply': 'Unusable model reply',
  deferred: 'Left for the next run',
};

export interface LogArticle {
  title: string;
  url: string;
  source: string;
  outcome: ArticleOutcome;
  /** The interest score, when the model gave one. */
  score?: number;
  reason?: string;
  /** For a video: whether it was read from its transcript or only from its description. */
  basis?: 'transcript' | 'description';
  /** For a video left for the next run: what it is waiting for. */
  awaiting?: 'transcript' | 'airing';
}

export interface LogFeed {
  id: string;
  name: string;
  items: number;
  error?: string;
  note?: string;
}

export interface LogProof {
  title: string;
  outcome: 'corrected' | 'unchanged' | 'kept' | 'skipped';
  /** Why some or all of the model's version was thrown away. */
  reason?: string;
}

export interface LogFigure {
  title: string;
  outcome: 'drawn' | 'none' | 'refused' | 'skipped';
  kind?: string;
  /** Whether the diagram was also drawn as an illustration, when one was asked for. */
  image?: 'made' | 'failed';
  reason?: string;
}

/** Counts for a run made before logs were kept, taken from its line in `data/stats.jsonl`. */
/** Something the run read from outside that is not a feed, such as the release dates or the share price. */
export interface LogCheck {
  /** What was read, as it reads in "... could not be read". */
  name: string;
  ok: boolean;
  /** Why it failed, when it did. */
  says?: string;
}

/** How the release edition's own step went, the last time it ran. Kept in `data/release-edition-status.json`. */
export interface ReleaseStatus {
  at: string;
  /** Nothing to do, a build, the notes not answering, or a build that failed. */
  outcome: 'nothing-awaited' | 'nothing-owed' | 'built' | 'could-not-ask' | 'failed';
  /** What was built, or why it could not be. */
  says?: string;
}

/** Whatever was saved, read as a status, or nothing when it is not one. */
export function readReleaseStatus(text: string): ReleaseStatus | undefined {
  try {
    const raw = JSON.parse(text) as Partial<ReleaseStatus>;
    const known = ['nothing-awaited', 'nothing-owed', 'built', 'could-not-ask', 'failed'];
    if (!raw || typeof raw.at !== 'string' || Number.isNaN(Date.parse(raw.at)) || !known.includes(raw.outcome ?? '')) return undefined;
    return { at: raw.at, outcome: raw.outcome!, ...(typeof raw.says === 'string' ? { says: raw.says } : {}) };
  } catch {
    return undefined;
  }
}

export interface LogTotals {
  fetched: number;
  reviewed: number;
  published: number;
}

export interface RunLogData {
  /** Which command ran. */
  kind: 'pipeline' | 'figures' | 'release';
  /** When it started. */
  ranAt: string;
  /** The edition it wrote into; empty when it covered several. */
  day: string;
  seconds: number;
  /** False when it stopped before getting through everything. */
  finished: boolean;
  stopped?: string;
  /**
   * What started it, on GitHub: "workflow_dispatch" for a run started from outside (the scheduler, or by hand) and
   * "schedule" for GitHub's own schedule, which is the backup. Absent for a run on a machine of one's own.
   */
  trigger?: string;
  /** The `ranAt` of this run's line in `data/stats.jsonl`, so the two are not shown twice. */
  statsAt?: string;
  feeds: LogFeed[];
  articles: LogArticle[];
  proofread: LogProof[];
  figures: LogFigure[];
  model: { calls: number; retries: Record<string, number>; usage: Record<string, { input: number; output: number }> };
  /** Why no video's transcript could be fetched in this run, when none could. */
  transcriptsDown?: string;
  /** What else the run read from outside, and whether each answered. */
  checks?: LogCheck[];
  /** Present on a run from before logs were kept: only its totals are known. */
  totals?: LogTotals;
  /** With `totals`: what became of the articles, as far as the run's stats line says. */
  outcomes?: { below: number; notRelevant: number; dropped: number; deferred: number; invalid: number };
}

const list = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
const record = <T>(value: unknown): Record<string, T> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, T>) : {});
const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/** A log file's contents, or null when it is not one. Missing parts are read as empty. */
export function readLog(text: string): RunLogData | null {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!raw || typeof raw.ranAt !== 'string' || Number.isNaN(Date.parse(raw.ranAt))) return null;
  const model = record<unknown>(raw.model);
  return {
    kind: raw.kind === 'figures' || raw.kind === 'release' ? raw.kind : 'pipeline',
    ranAt: raw.ranAt,
    day: typeof raw.day === 'string' ? raw.day : '',
    seconds: count(raw.seconds),
    finished: raw.finished !== false,
    stopped: typeof raw.stopped === 'string' ? raw.stopped : undefined,
    ...(typeof raw.trigger === 'string' ? { trigger: raw.trigger } : {}),
    statsAt: typeof raw.statsAt === 'string' ? raw.statsAt : undefined,
    feeds: list(raw.feeds),
    articles: list(raw.articles),
    proofread: list(raw.proofread),
    figures: list(raw.figures),
    model: { calls: count(model.calls), retries: record(model.retries), usage: record(model.usage) },
    ...(typeof raw.transcriptsDown === 'string' ? { transcriptsDown: raw.transcriptsDown } : {}),
    ...(Array.isArray(raw.checks) ? { checks: list<LogCheck>(raw.checks).filter((check) => check && typeof check.name === 'string') } : {}),
  };
}

/**
 * Runs from `data/stats.jsonl` that have no log of their own, as entries
 * carrying totals only. `known` holds the `statsAt` of every log.
 */
export function legacyRuns(statsText: string, known: Set<string>): RunLogData[] {
  const runs: RunLogData[] = [];
  for (const raw of jsonLines(statsText)) {
    if (typeof raw.ranAt !== 'string' || Number.isNaN(Date.parse(raw.ranAt)) || known.has(raw.ranAt)) continue;
    // Early runs listed failed feeds; later ones record each with its count of failures.
    const failed = Array.isArray(raw.failedFeeds) ? (raw.failedFeeds as string[]) : Object.keys(record(raw.failedFeeds));
    const usage = record<{ input: number; output: number }>(raw.tokensByModel);
    runs.push({
      kind: 'pipeline',
      ranAt: raw.ranAt,
      day: typeof raw.date === 'string' ? raw.date : '',
      seconds: 0,
      finished: count(raw.deferred) === 0,
      stopped: count(raw.deferred) > 0 ? `${count(raw.deferred)} left for the next run` : undefined,
      feeds: failed.map((id) => ({ id, name: id, items: 0, error: 'failed (the error was not kept)' })),
      articles: [],
      proofread: [],
      figures: [],
      model: { calls: count(raw.llmCalls), retries: record(raw.retries), usage },
      totals: { fetched: count(raw.fetched), reviewed: count(raw.assessed), published: count(raw.published) },
      outcomes: { below: count(raw.belowThreshold), notRelevant: count(raw.notRelevant), dropped: count(raw.prefiltered), deferred: count(raw.deferred), invalid: count(raw.invalidReplies) },
    });
  }
  return runs;
}

/** What each run cost in US dollars, by the `ranAt` of its line in `data/stats.jsonl`, for the runs that recorded it. */
export function costsByRun(statsText: string): Record<string, number> {
  const costs: Record<string, number> = {};
  for (const raw of jsonLines(statsText)) {
    if (typeof raw.ranAt === 'string' && typeof raw.costUsd === 'number' && raw.costUsd >= 0) costs[raw.ranAt] = raw.costUsd;
  }
  return costs;
}

/** The name a run goes by in the page, so that it can be linked to. */
export const runId = (ranAt: string) => `run-${ranAt.replace(/[^0-9A-Za-z]+/g, '-')}`;

/** Newest first. */
export const byNewest = (a: RunLogData, b: RunLogData) => b.ranAt.localeCompare(a.ranAt);

/** What went wrong in a run, in plain words. Empty when nothing did. */
export function problems(log: RunLogData): string[] {
  const found: string[] = [];
  const say = (n: number, one: string, many: string) => n > 0 && found.push(`${n} ${n === 1 ? one : many}`);
  if (!log.finished) found.push(log.stopped ? `stopped early: ${log.stopped}` : 'stopped early');
  say(log.feeds.filter((f) => f.error).length, 'feed failed', 'feeds failed');
  for (const check of log.checks ?? []) if (!check.ok) found.push(`${check.name} could not be read${check.says ? ` (${check.says})` : ''}`);
  say(log.articles.filter((a) => a.outcome === 'invalid-reply').length, 'unusable model reply', 'unusable model replies');
  say(log.proofread.filter((p) => proofFate(p) === 'not-read').length, 'story not proof-read', 'stories not proof-read');
  say(log.figures.filter((f) => f.outcome === 'refused').length, 'diagram refused', 'diagrams refused');
  say(log.figures.filter((f) => f.image === 'failed').length, 'illustration not made', 'illustrations not made');
  return found;
}

/**
 * What became of one story's proof-read, as far as the page is concerned.
 * - "not-read": the proof-reader never saw it (the call cap, or the model down). A problem.
 * - "refused": every change was refused, so the story was printed as written. A note.
 * - "partly": some fields were refused and put back as written; the others were printed corrected. A note.
 * - "fine": nothing was refused.
 * The pipeline guarantees what "refused" and "partly" claim (see pipeline/curate.ts, judgeProof, and its tests).
 */
export function proofFate(proof: LogProof): 'not-read' | 'refused' | 'partly' | 'fine' {
  if (!proof.reason) return 'fine';
  if (proof.outcome === 'skipped') return 'not-read';
  return proof.outcome === 'kept' ? 'refused' : 'partly';
}

/** What is worth knowing about a run but did no harm. Empty when there is nothing. */
export function notes(log: RunLogData): string[] {
  const fates = log.proofread.map(proofFate);
  const refused = fates.filter((fate) => fate === 'refused').length;
  const partly = fates.filter((fate) => fate === 'partly').length;
  const found: string[] = [];
  if (refused) found.push(refused === 1 ? '1 proof-read not used: the story was printed as written' : `${refused} proof-reads not used: the stories were printed as written`);
  if (partly) found.push(partly === 1 ? '1 proof-read partly used: a refused change was put back as written, the rest printed corrected' : `${partly} proof-reads partly used: refused changes were put back as written, the rest printed corrected`);
  return found;
}

/** The tag on a run's line: problems first, then notes, else fine. */
export function runMark(log: RunLogData): { tone: 'bad' | 'note' | 'fine'; label: string } {
  if (problems(log).length) return { tone: 'bad', label: 'Problems' };
  if (notes(log).length) return { tone: 'note', label: 'Fine, a note' };
  return { tone: 'fine', label: 'Fine' };
}

/** One day on the Runs timeline. */
export interface RunDay {
  day: string;
  runs: RunLogData[];
  /** What the day's priced runs cost, in US dollars. */
  cost: number;
  /** It had runs, and none had a recorded cost. */
  unpriced: boolean;
  calls: number;
  /** How many of its runs had problems: such a day is drawn as one with problems. Notes do not count. */
  problems: number;
  /** The run its column opens: the day's latest. */
  latest?: RunLogData;
}

/** The Runs timeline: one entry for each of `days`, oldest first, whether or not anything ran. */
export function runDays(logs: RunLogData[], days: string[], dayOf: (ranAt: string) => string, costOf: (log: RunLogData) => number | undefined): RunDay[] {
  return days.map((day) => {
    const runs = logs.filter((log) => dayOf(log.ranAt) === day).sort(byNewest);
    const costs = runs.map(costOf).filter((cost): cost is number => cost !== undefined);
    return {
      day,
      runs,
      cost: costs.reduce((sum, cost) => sum + cost, 0),
      unpriced: runs.length > 0 && costs.length === 0,
      calls: runs.reduce((sum, log) => sum + log.model.calls, 0),
      problems: runs.filter((log) => runMark(log).tone === 'bad').length,
      latest: runs[0],
    };
  });
}

/** The counts for a run's summary line. */
export function summary(log: RunLogData): LogTotals & { calls: number } {
  const totals = log.totals ?? {
    fetched: log.feeds.reduce((sum, feed) => sum + feed.items, 0),
    reviewed: log.articles.filter((a) => a.outcome !== 'dropped' && a.outcome !== 'deferred').length,
    published: log.articles.filter((a) => a.outcome === 'published').length,
  };
  return { ...totals, calls: log.model.calls };
}

/**
 * Editions where the site is serving a different number of stories than there
 * are story files, newest first. A dev server can stop noticing new files
 * after it restarts itself; a restart by hand brings it up to date.
 */
export function staleEditions(onDisk: Record<string, number>, served: Record<string, number>): { day: string; onDisk: number; served: number }[] {
  return [...new Set([...Object.keys(onDisk), ...Object.keys(served)])]
    .map((day) => ({ day, onDisk: onDisk[day] ?? 0, served: served[day] ?? 0 }))
    .filter((edition) => edition.onDisk !== edition.served)
    .sort((a, b) => b.day.localeCompare(a.day));
}
