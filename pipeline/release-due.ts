import { REFRESH_DAYS } from '../src/lib/release-changes';
import type { Edition } from '../src/lib/release-edition';
import type { Release } from '../src/lib/releases';

// When a release edition is built. Once when the notes of a new release first appear, and again once the release
// has reached the last of production, by when the notes have been filled out. After that the notes are checked
// once a week while the release is current, since Salesforce goes on revising them: a check reads the notes again,
// compares them with what the last one saw, and has only what changed read by the model (src/lib/release-changes.ts).

export interface Due {
  /** The maker's number for the release, such as "264.0.0". */
  number: string;
  reason: 'new' | 'production' | 'refresh';
}

/** The day a release has reached all of production, when the calendar gives one. */
export function productionDay(release: Release | undefined): string | undefined {
  return release?.stages.filter((stage) => stage.place === 'production').at(-1)?.to;
}

const releaseOf = (edition: Edition, releases: Release[]) => releases.find((release) => release.name === edition.release.name);

/** The editions built before their release reached production, now that it has. */
function finished(editions: Edition[], releases: Release[], today: string): Edition[] {
  return editions.filter((edition) => {
    const day = productionDay(releaseOf(edition, releases));
    return day !== undefined && today >= day && edition.builtAt.slice(0, 10) < day;
  });
}

const days = (from: string, to: string) => Math.floor((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from.slice(0, 10)}T12:00:00Z`)) / 86_400_000);
const byNumber = (a: Edition, b: Edition) => b.release.number.localeCompare(a.release.number, 'en', { numeric: true });

/**
 * The editions owed a check of their notes: those that have had both builds, were last checked REFRESH_DAYS or
 * more ago, and whose release is current. A release is current while it is the newest with an edition, and the one
 * before it stays current until its successor has reached production, since until then most orgs are still on it.
 */
export function stale(editions: Edition[], releases: Release[], today: string): Edition[] {
  const newest = [...editions].sort(byNumber);
  return newest.filter((edition, i) => {
    const day = productionDay(releaseOf(edition, releases));
    if (day === undefined || edition.builtAt.slice(0, 10) < day) return false;
    if (days(edition.checkedAt ?? edition.builtAt, today) < REFRESH_DAYS) return false;
    if (i === 0) return true;
    const next = productionDay(releaseOf(newest[i - 1], releases));
    return i === 1 && (next === undefined || today < next);
  });
}

/**
 * Whether there is anything to ask the notes about today. There is while a release the calendar names has no
 * edition, an edition is owed its second build, or one is owed its weekly check. A paper with no calendar cannot
 * tell, and asks.
 */
export function waiting(editions: Edition[], releases: Release[], today: string): boolean {
  if (releases.length === 0) return true;
  return releases.some((release) => !editions.some((edition) => edition.release.name === release.name)) || finished(editions, releases, today).length > 0 || stale(editions, releases, today).length > 0;
}

/** What is to be built today. `latest` is the newest release that has notes, when that could be learnt. */
export function due(editions: Edition[], releases: Release[], latest: string | undefined, today: string): Due[] {
  const owed: Due[] = finished(editions, releases, today).map((edition) => ({ number: edition.release.number, reason: 'production' }));
  for (const edition of stale(editions, releases, today)) owed.push({ number: edition.release.number, reason: 'refresh' });
  if (latest && !editions.some((edition) => edition.release.number === latest)) owed.unshift({ number: latest, reason: 'new' });
  return owed;
}
