import fs from 'node:fs';
import path from 'node:path';

const SEEN_PATH = path.join(process.cwd(), 'data', 'seen.json');
const TRACKING = /^(utm_.*|fbclid|gclid|mc_cid|mc_eid|source|ref|sk)$/i;

/** One form per article, so the same post reached through two feeds is seen once. */
export function canonicalUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hash = '';
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING.test(key)) url.searchParams.delete(key);
    }
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString();
  } catch {
    return raw.trim();
  }
}

/** Canonical URL to the edition day on which it was processed. */
export type Seen = Record<string, string>;

export function loadSeen(): Seen {
  try {
    return JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8')) as Seen;
  } catch {
    return {};
  }
}

export function saveSeen(seen: Seen): void {
  fs.mkdirSync(path.dirname(SEEN_PATH), { recursive: true });
  fs.writeFileSync(SEEN_PATH, JSON.stringify(seen, null, 2) + '\n');
}

// Articles met but not yet dealt with: the page could not be read, or the run
// ran out of calls. They are kept apart from `seen` so that they are tried
// again, counted once, and given up on in the end.

export interface Waiting {
  /** The id of the source it came from. */
  source: string;
  /** The edition day on which it was first met. */
  since: string;
  why: 'unread' | 'deferred' | 'no-transcript' | 'upcoming';
}

/** Canonical URL to what is waiting on it. */
export type Pending = Record<string, Waiting>;

const PENDING_PATH = path.join(process.cwd(), 'data', 'pending.json');

/** Days a page is tried again before it is given up on. */
export const GIVE_UP_DAYS = 3;
/** Days a video waits for its transcript before it is judged on its description. A new upload often has no captions for some hours. */
export const TRANSCRIPT_WAIT_DAYS = 2;
/** Days anything may wait before it is dropped, so an article that has left its feed does not wait for ever. */
export const FORGET_DAYS = 7;

export function loadPending(): Pending {
  try {
    return JSON.parse(fs.readFileSync(PENDING_PATH, 'utf8')) as Pending;
  } catch {
    return {};
  }
}

export function savePending(pending: Pending): void {
  fs.mkdirSync(path.dirname(PENDING_PATH), { recursive: true });
  fs.writeFileSync(PENDING_PATH, JSON.stringify(pending, null, 2) + '\n');
}

/** Whole days from one edition day to another. */
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);

/** Whether a page that still cannot be read has been tried for long enough. */
export const givenUp = (waiting: Waiting | undefined, day: string) => waiting !== undefined && daysBetween(waiting.since, day) >= GIVE_UP_DAYS;

/** Days a live event that has not been held is waited for. Long enough for one announced weeks ahead; not for ever, since some are called off. */
export const UPCOMING_DAYS = 45;

/** Whether a video has waited long enough for a transcript that has not come. */
export const transcriptOverdue = (waiting: Waiting | undefined, day: string) => waiting !== undefined && daysBetween(waiting.since, day) >= TRANSCRIPT_WAIT_DAYS;

/** Move what has waited too long from `pending` to `seen`. Returns the addresses moved. */
export function forget(pending: Pending, seen: Seen, day: string): string[] {
  const gone = Object.keys(pending).filter((key) => daysBetween(pending[key].since, day) >= (pending[key].why === 'upcoming' ? UPCOMING_DAYS : FORGET_DAYS));
  for (const key of gone) {
    seen[key] = day;
    delete pending[key];
  }
  return gone;
}

/** The ids of sources that have an article waiting. */
export const waitingSources = (pending: Pending) => new Set(Object.values(pending).map((waiting) => waiting.source));
