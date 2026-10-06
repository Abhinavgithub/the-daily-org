// The Bulletin: what the paper keeps apart from its stories. It shows the
// picture as it stands, not one day's items, so each kind of thing is kept on
// the page for a while and then dropped. This also works out, in the browser,
// how many of them a reader has not yet seen.

export type BulletinKind = 'alert' | 'release' | 'community';

/** Days a kind of item stays on the page, counted back from the latest edition. */
export const WINDOWS: Record<BulletinKind, number> = { alert: 14, release: 30, community: 7 };
/** A reader who has never opened the Bulletin is told only of the last few days. */
export const FIRST_VISIT_DAYS = 2;

const DAY = 86_400_000;
const time = (day: string) => Date.parse(`${day}T00:00:00Z`);
/** Whole days from one day to a later one. Days are YYYY-MM-DD. */
export const daysApart = (from: string, to: string) => Math.round((time(to) - time(from)) / DAY);

/** Whether an item of `kind`, printed on `date`, is still on the page when the latest edition is `latest`. */
export function inWindow(kind: BulletinKind, date: string, latest: string): boolean {
  const age = daysApart(date, latest);
  return age >= 0 && age < WINDOWS[kind];
}

/** What the page carries of each item so the counts can be worked out: its name, the day it was printed, and whether it is an incident. */
export interface Listed {
  id: string;
  date: string;
  /** A failure of the service itself, which is counted apart and shown in red. */
  incident?: boolean;
}

/**
 * Whether an item is counted on the tab at all. A tool's release is not: there
 * is one most weeks, and none of them is pressing.
 */
export const counted = (kind: BulletinKind) => kind !== 'release';

/**
 * How many items the reader has not seen: incidents, and everything else that
 * is counted. `seen` is the names remembered from earlier visits, or null for a
 * reader who has never opened the Bulletin, who is told only of the last few
 * days so as not to be met with a large number.
 */
export function unseen(items: Listed[], seen: string[] | null, latest: string): { incidents: number; others: number } {
  const known = new Set(seen ?? []);
  const fresh = items.filter((item) => (seen === null ? daysApart(item.date, latest) < FIRST_VISIT_DAYS : !known.has(item.id)));
  const incidents = fresh.filter((item) => item.incident).length;
  return { incidents, others: fresh.length - incidents };
}

/** Where the browser keeps what has been seen. */
export const SEEN_KEY = 'bulletin-seen';
