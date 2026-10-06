// What a run of the pipeline leaves behind for the Logs page, which is for
// whoever runs the paper and exists only on their machine. Pure functions: the
// pipeline writes these, the page reads them.

export type ArticleOutcome = 'published' | 'below-threshold' | 'not-relevant' | 'dropped' | 'invalid-reply' | 'deferred';

export const OUTCOME_LABELS: Record<ArticleOutcome, string> = {
  published: 'Published',
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
  awaiting?: 'transcript';
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
export interface LogTotals {
  fetched: number;
  reviewed: number;
  published: number;
}

export interface RunLogData {
  /** Which command ran. */
  kind: 'pipeline' | 'figures';
  /** When it started. */
  ranAt: string;
  /** The edition it wrote into; empty when it covered several. */
  day: string;
  seconds: number;
  /** False when it stopped before getting through everything. */
  finished: boolean;
  stopped?: string;
  /** The `ranAt` of this run's line in `data/stats.jsonl`, so the two are not shown twice. */
  statsAt?: string;
  feeds: LogFeed[];
  articles: LogArticle[];
  proofread: LogProof[];
  figures: LogFigure[];
  model: { calls: number; retries: Record<string, number>; usage: Record<string, { input: number; output: number }> };
  /** Why no video's transcript could be fetched in this run, when none could. */
  transcriptsDown?: string;
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
    kind: raw.kind === 'figures' ? 'figures' : 'pipeline',
    ranAt: raw.ranAt,
    day: typeof raw.day === 'string' ? raw.day : '',
    seconds: count(raw.seconds),
    finished: raw.finished !== false,
    stopped: typeof raw.stopped === 'string' ? raw.stopped : undefined,
    statsAt: typeof raw.statsAt === 'string' ? raw.statsAt : undefined,
    feeds: list(raw.feeds),
    articles: list(raw.articles),
    proofread: list(raw.proofread),
    figures: list(raw.figures),
    model: { calls: count(model.calls), retries: record(model.retries), usage: record(model.usage) },
    ...(typeof raw.transcriptsDown === 'string' ? { transcriptsDown: raw.transcriptsDown } : {}),
  };
}

/**
 * Runs from `data/stats.jsonl` that have no log of their own, as entries
 * carrying totals only. `known` holds the `statsAt` of every log.
 */
export function legacyRuns(statsText: string, known: Set<string>): RunLogData[] {
  const runs: RunLogData[] = [];
  for (const line of statsText.split('\n')) {
    if (!line.trim()) continue;
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }
    if (!raw || typeof raw.ranAt !== 'string' || Number.isNaN(Date.parse(raw.ranAt)) || known.has(raw.ranAt)) continue;
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
  for (const line of statsText.split('\n')) {
    try {
      const raw = JSON.parse(line) as Record<string, unknown>;
      if (typeof raw.ranAt === 'string' && typeof raw.costUsd === 'number' && raw.costUsd >= 0) costs[raw.ranAt] = raw.costUsd;
    } catch {
      // Not a run.
    }
  }
  return costs;
}

/** Newest first. */
export const byNewest = (a: RunLogData, b: RunLogData) => b.ranAt.localeCompare(a.ranAt);

/** What went wrong in a run, in plain words. Empty when nothing did. */
export function problems(log: RunLogData): string[] {
  const found: string[] = [];
  const say = (n: number, one: string, many: string) => n > 0 && found.push(`${n} ${n === 1 ? one : many}`);
  if (!log.finished) found.push(log.stopped ? `stopped early: ${log.stopped}` : 'stopped early');
  say(log.feeds.filter((f) => f.error).length, 'feed failed', 'feeds failed');
  say(log.articles.filter((a) => a.outcome === 'invalid-reply').length, 'unusable model reply', 'unusable model replies');
  say(log.proofread.filter((p) => p.reason).length, 'proof-read discarded', 'proof-reads discarded');
  say(log.figures.filter((f) => f.outcome === 'refused').length, 'diagram refused', 'diagrams refused');
  return found;
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
