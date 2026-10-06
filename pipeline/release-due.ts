import type { Edition } from '../src/lib/release-edition';
import type { Release } from '../src/lib/releases';

// When a release edition is built. Twice, and no more: when the notes of a new
// release first appear, and again once the release has reached the last of
// production, by when the notes have been filled out. The notes are revised all
// through a release; the edition does not follow them day by day.

export interface Due {
  /** The maker's number for the release, such as "264.0.0". */
  number: string;
  reason: 'new' | 'production';
}

/** The day a release has reached all of production, when the calendar gives one. */
export function productionDay(release: Release | undefined): string | undefined {
  return release?.stages.filter((stage) => stage.place === 'production').at(-1)?.to;
}

/** The editions built before their release reached production, now that it has. */
function finished(editions: Edition[], releases: Release[], today: string): Edition[] {
  return editions.filter((edition) => {
    const day = productionDay(releases.find((release) => release.name === edition.release.name));
    return day !== undefined && today >= day && edition.builtAt.slice(0, 10) < day;
  });
}

/**
 * Whether there is anything to ask the notes about today. There is while a
 * release the calendar names has no edition, or an edition is owed its second
 * build. A paper with no calendar cannot tell, and asks.
 */
export function waiting(editions: Edition[], releases: Release[], today: string): boolean {
  if (releases.length === 0) return true;
  return releases.some((release) => !editions.some((edition) => edition.release.name === release.name)) || finished(editions, releases, today).length > 0;
}

/** What is to be built today. `latest` is the newest release that has notes, when that could be learnt. */
export function due(editions: Edition[], releases: Release[], latest: string | undefined, today: string): Due[] {
  const owed: Due[] = finished(editions, releases, today).map((edition) => ({ number: edition.release.number, reason: 'production' }));
  if (latest && !editions.some((edition) => edition.release.number === latest)) owed.unshift({ number: latest, reason: 'new' });
  return owed;
}
