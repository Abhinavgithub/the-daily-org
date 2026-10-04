import { getCollection, type CollectionEntry } from 'astro:content';
import { byRank, signalOf, type Signal } from './signal';

export type Story = CollectionEntry<'stories'>;

export interface Edition {
  day: string;
  stories: Story[];
}

const rank = (a: Story, b: Story) => byRank(a.data, b.data);

/** All editions, newest first, each with its stories ranked best first. */
export async function getEditions(): Promise<Edition[]> {
  const all = await getCollection('stories');
  const byDay = new Map<string, Story[]>();
  for (const story of all) {
    const list = byDay.get(story.data.date) ?? [];
    list.push(story);
    byDay.set(story.data.date, list);
  }
  return [...byDay.entries()]
    .map(([day, stories]) => ({ day, stories: stories.sort(rank) }))
    .sort((a, b) => b.day.localeCompare(a.day));
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
