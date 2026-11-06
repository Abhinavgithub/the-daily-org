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

/**
 * The day the Bulletin is as of: the latest edition, or the newest item when a
 * run printed to the Bulletin without making an edition. Never earlier than the
 * latest edition, so the page cannot look older than the front page. `today`
 * is used only when there is nothing at all.
 */
export function bulletinAsOf(editionDay: string | undefined, itemDays: string[], today: string): string {
  return [editionDay, ...itemDays].filter((day): day is string => Boolean(day)).sort().at(-1) ?? today;
}

/** What a built site says of its dates: the front page's edition, the Bulletin's date, and its newest item. */
export interface SiteDates {
  edition?: string;
  asOf?: string;
  newestItem?: string;
}

/**
 * What is wrong with the dates a built site shows, in words, or nothing. The
 * Bulletin must be as of exactly what `bulletinAsOf` makes of the front page's
 * edition and its own newest item: an older date means a stale page was served.
 */
export function dateProblems({ edition, asOf, newestItem }: SiteDates): string[] {
  if (!asOf) return ['The Bulletin does not say what day it is as of.'];
  if (!edition) return ['The front page does not say what edition it is.'];
  const expected = bulletinAsOf(edition, newestItem ? [newestItem] : [], asOf);
  return asOf === expected ? [] : [`The Bulletin is as of ${asOf}, but the front page's edition is ${edition}${newestItem ? ` and its newest item is of ${newestItem}` : ''}: it should be as of ${expected}.`];
}

/** The dates in the front page's and the Bulletin's HTML, as `dateProblems` takes them. */
export function readSiteDates(home: string, bulletin: string): SiteDates {
  const attr = (tag: string | undefined, name: string) => tag?.match(new RegExp(`\\s${name}="(\\d{4}-\\d{2}-\\d{2})"`))?.[1];
  const html = home.match(/<html\b[^>]*>/)?.[0];
  const time = bulletin.match(/<time\b[^>]*\sdata-bulletin-as-of\b[^>]*>/)?.[0];
  return { edition: attr(html, 'data-edition'), asOf: attr(time, 'datetime'), newestItem: attr(time, 'data-newest-item') };
}
