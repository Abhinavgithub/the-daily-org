import fs from 'node:fs';
import path from 'node:path';

// What the pipeline remembers about each feed between runs: when it was last
// read in full, and how many runs in a row it has failed.

export interface SourceState {
  /** When the feed was last fetched by a run that also got through all of its items. */
  lastSuccessAt?: string;
  /** Runs in a row in which the feed could not be fetched. */
  failures: number;
  lastError?: string;
  /** When the feed's newest post was published, as of the last time it was fetched. */
  lastPostAt?: string;
}

export type State = Record<string, SourceState>;

const DAY = 86_400_000;
/** Look-back for a feed with no record: new, or never read in full. */
export const NEW_SOURCE_DAYS = 7;
const MIN_DAYS = 2;
/** After this many failed runs in a row, the run says so loudly. */
export const FAILING_AFTER = 3;

/**
 * How many days back to read a feed: from its last success, with a day's
 * margin, so an outage of any length is covered once the feed returns.
 */
export function lookBackDays(state: State, id: string, now = Date.now()): number {
  const last = Date.parse(state[id]?.lastSuccessAt ?? '');
  if (Number.isNaN(last)) return NEW_SOURCE_DAYS;
  return Math.max(MIN_DAYS, Math.ceil((now - last) / DAY) + 1);
}

/** The feed could not be fetched on this run. */
export function recordFailure(state: State, id: string, error: string): void {
  const entry = (state[id] ??= { failures: 0 });
  entry.failures++;
  entry.lastError = error;
}

/** The feed was fetched on this run. Ends a failure streak, but is not yet a success. */
export function recordFetched(state: State, id: string): void {
  const entry = (state[id] ??= { failures: 0 });
  entry.failures = 0;
  delete entry.lastError;
}

/** The newest post the feed had when it was fetched. */
export function recordNewest(state: State, id: string, newest: Date): void {
  (state[id] ??= { failures: 0 }).lastPostAt = newest.toISOString();
}

/**
 * The run got through everything these feeds offered, so the next run can
 * start from here. Not called for a run that stopped early or hit its cap.
 */
export function recordComplete(state: State, ids: string[], at: Date): void {
  for (const id of ids) (state[id] ??= { failures: 0 }).lastSuccessAt = at.toISOString();
}

/** Feeds that have failed often enough to need a person's attention. */
export function failingSources(state: State): [string, SourceState][] {
  return Object.entries(state).filter(([, entry]) => entry.failures >= FAILING_AFTER);
}

// Files -------------------------------------------------------------------

const dataDir = () => path.join(process.cwd(), 'data');
const statePath = () => path.join(dataDir(), 'sources.json');
/** The earlier record: a plain list of feeds read in full, written at the end of a complete run. */
const legacyPath = () => path.join(dataDir(), 'known-sources.json');

export function loadState(): State {
  try {
    return JSON.parse(fs.readFileSync(statePath(), 'utf8')) as State;
  } catch {
    // Fall through to the earlier format, or an empty state.
  }
  try {
    const ids = JSON.parse(fs.readFileSync(legacyPath(), 'utf8')) as string[];
    const at = fs.statSync(legacyPath()).mtime;
    const state: State = {};
    recordComplete(state, ids, at);
    return state;
  } catch {
    return {};
  }
}

export function saveState(state: State): void {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2) + '\n');
  fs.rmSync(legacyPath(), { force: true });
}
