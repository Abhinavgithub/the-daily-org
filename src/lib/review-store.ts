import fs from 'node:fs';
import path from 'node:path';
import { normalizeUrl } from '../../pipeline/feedback';
import { HOLD_DAYS } from '../../pipeline/hold';
import { SOURCES } from '../../pipeline/sources';
import { loadHandled, loadReaderFeedback } from '../../pipeline/verdict-dev';
import { openStory } from '../../pipeline/write';
import { PAPER } from '../config';
import { byNewest, readLog, readReleaseStatus, type RunLogData } from './logs';
import { readReleases } from './releases';
import { getReleaseEditions } from './release-store';
import { feedsFrom, flagsFrom, heldFrom, issuesFrom, queue, readDone, releasesFrom, reportsFrom, waitingFrom, type ReviewItem } from './review';
import { getAllStories, storyHref } from './stories';

// The review queue as the pages show it, read from the files the paper keeps (src/lib/review.ts makes the items).
// It reads files, so it is for pages and never for a script that runs in the browser. Readers' reports are private:
// they are read only when `withReports` is set, which a page does only under the dev server.

const DATA = path.join(process.cwd(), 'data');
const read = (file: string) => (fs.existsSync(path.join(DATA, file)) ? fs.readFileSync(path.join(DATA, file), 'utf8') : '');
const json = <T>(file: string, fallback: T): T => {
  try {
    return JSON.parse(read(file)) as T;
  } catch {
    return fallback;
  }
};
const address = (url: string) => {
  try {
    return normalizeUrl(url);
  } catch {
    return url;
  }
};

export async function reviewQueue({ withReports, now = new Date() }: { withReports: boolean; now?: Date }) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: PAPER.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const logs = (fs.existsSync(path.join(DATA, 'logs')) ? fs.readdirSync(path.join(DATA, 'logs')) : [])
    .filter((file) => file.endsWith('.json'))
    .map((file) => readLog(read(path.join('logs', file))))
    .filter((log): log is RunLogData => log !== null && log.kind === 'pipeline')
    .sort(byNewest);

  // Where each article is printed: its own story, or the story it is now a line under.
  const stories = await getAllStories();
  const printed = new Map<string, string>();
  for (const story of stories) {
    printed.set(address(story.data.url), storyHref(story));
    for (const also of story.data.also ?? []) printed.set(address(also.url), storyHref(story));
  }

  const heldDir = path.join(DATA, 'held');
  const held = (fs.existsSync(heldDir) ? fs.readdirSync(heldDir) : [])
    .filter((name) => name.endsWith('.md'))
    .sort()
    .flatMap((name) => {
      const story = openStory(fs.readFileSync(path.join(heldDir, name), 'utf8'));
      return story ? [{ name, data: story.doc.toJS() as Record<string, unknown>, body: story.body }] : [];
    });

  const editions = getReleaseEditions().map((edition) => ({ name: edition.release.name, slug: edition.release.slug, builtAt: edition.builtAt, notesPublished: edition.notesPublished, notes: edition.notes, changes: edition.changes }));
  const sourceName = (id: string) => SOURCES.find((source) => source.id === id)?.name ?? id;
  const byStory = new Map(stories.map((story) => [story.id, { title: story.data.title, href: storyHref(story), url: story.data.url }]));

  const items: ReviewItem[] = [
    ...flagsFrom(logs, printed, now),
    ...(withReports ? reportsFrom(loadReaderFeedback().reports, loadHandled(), byStory) : []),
    ...heldFrom(held, logs, HOLD_DAYS),
    ...waitingFrom(logs, json('pending.json', {}), sourceName, now),
    ...feedsFrom(json('sources.json', {}), SOURCES),
    ...issuesFrom(json('known-issues.json', {}), today),
    ...releasesFrom(readReleaseStatus(read('release-edition-status.json')), editions, readReleases(json('releases.json', null)), today, now),
  ];
  return queue(items, readDone(read('review.json')), now);
}
