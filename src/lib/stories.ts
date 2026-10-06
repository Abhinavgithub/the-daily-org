import { getCollection, type CollectionEntry } from 'astro:content';
import { hasBriefs, hasBulletin } from '../content.config';
import { inWindow } from './bulletin';
import { groupEditions } from './editions';
import { byRank, signalOf, type Signal } from './signal';

export type Story = CollectionEntry<'stories'>;
export type Brief = CollectionEntry<'briefs'>;
export type BulletinItem = CollectionEntry<'bulletin'>;

export interface Edition {
  day: string;
  stories: Story[];
  /** Close calls printed as one line each. A day with these and no stories is still an edition. */
  briefs: Brief[];
}

/** All editions, newest first, each with its stories and its briefs ranked best first. */
export async function getEditions(): Promise<Edition[]> {
  // Asking for a collection with nothing in it is warned about, so the briefs are asked for only once there are some.
  const [stories, briefs] = await Promise.all([getCollection('stories'), hasBriefs ? getCollection('briefs') : []]);
  return groupEditions(stories, briefs, { stories: (a, b) => byRank(a.data, b.data), briefs: (a, b) => byRank(a.data, b.data) });
}

/**
 * The Bulletin as it stands: the items still within their time on the page,
 * newest first, and the day they are counted back from, which is the latest edition's.
 */
export async function getBulletin(): Promise<{ latest: string; items: BulletinItem[] }> {
  const all = hasBulletin ? await getCollection('bulletin') : [];
  const newest = [(await getEditions())[0]?.day, ...all.map((item) => item.data.date)].filter((day): day is string => Boolean(day)).sort().at(-1);
  const latest = newest ?? new Date().toISOString().slice(0, 10);
  const items = all.filter((item) => inWindow(item.data.kind, item.data.date, latest)).sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
  return { latest, items };
}

/** Every story, newest edition first, best first within an edition. */
export async function getAllStories(): Promise<Story[]> {
  return (await getEditions()).flatMap((edition) => edition.stories);
}

/** Each story's mark, earned by its rank within its own edition. */
export async function getSignals(): Promise<Map<string, Signal>> {
  const signals = new Map<string, Signal>();
  for (const { stories } of await getEditions()) {
    stories.forEach((story, i) => signals.set(story.id, signalOf(i, stories.length)));
  }
  return signals;
}

/** The story's name within its edition, used as its link anchor. */
export function storySlug(story: Story): string {
  return story.id.split('/').pop()!;
}

/** Where a story can be opened: its edition page with the reader on that story. */
export function storyHref(story: Story): string {
  return `/${story.data.date}/#${storySlug(story)}`;
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Ann Lee", "Ann Lee and Raj Rao", "Ann Lee, Raj Rao and Mei Chen". */
export function formatAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors[0] ?? '';
  return `${authors.slice(0, -1).join(', ')} and ${authors.at(-1)}`;
}

export function formatDay(day: string, style: 'long' | 'short' = 'long'): string {
  const date = new Date(`${day}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function countLabel(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
