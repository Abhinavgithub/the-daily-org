import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { daysBetween } from './dedupe';
import { STORIES_DIR } from './write';

// A full day's surplus is kept for a quiet one. Sources post on weekdays and hardly at all at the weekend, so
// without this a day of eight stories is followed by days of none. A held story is a story file as it was
// written, kept out of the paper in data/held/ until there is room for it.

/** Read with `readEdition('held', DATA_DIR)`, so a held story can be told again like any printed one. */
export const DATA_DIR = path.join(process.cwd(), 'data');
export const HELD = 'held';
/** Days a story may be held. After that it is printed whether or not the day has room. */
export const HOLD_DAYS = 3;

export interface HoldOptions {
  /** The most stories a day prints while there is anything to hold. */
  stories: number;
  /** Sections whose stories are never held, because they are news of the day. */
  never?: readonly string[];
  storiesDir?: string;
  dataDir?: string;
}

interface Story {
  file: string;
  data: Record<string, unknown>;
}

function read(dir: string): Story[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .flatMap((f) => {
      const file = path.join(dir, f);
      const match = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n/);
      const data = match ? (parseDocument(match[1]).toJS() as Record<string, unknown> | null) : null;
      return data ? [{ file, data }] : [];
    });
}

const score = (story: Story) => (typeof story.data.interest_score === 'number' ? story.data.interest_score : 0);
/** The day a held story was put by, which its file is named for. */
const heldOn = (file: string) => path.basename(file).slice(0, 10);

/** The held stories, the longest held first and the best of a day before the rest of it. */
function held(dataDir: string): Story[] {
  return read(path.join(dataDir, HELD)).sort((a, b) => heldOn(a.file).localeCompare(heldOn(b.file)) || score(b) - score(a));
}

/**
 * The held stories that would be printed today: those held long enough, and as many more as the day has room for.
 * One held today is not printed today.
 */
export function dueToday(day: string, options: HoldOptions): string[] {
  const { stories, storiesDir = STORIES_DIR, dataDir = DATA_DIR } = options;
  const waiting = held(dataDir).filter((story) => heldOn(story.file) !== day);
  const overdue = waiting.filter((story) => daysBetween(heldOn(story.file), day) >= HOLD_DAYS).length;
  const room = stories - read(path.join(storiesDir, day)).length;
  return waiting.slice(0, Math.max(overdue, room, 0)).map((story) => story.file);
}

export interface Moved {
  /** Where the story is now. */
  file: string;
  title: string;
  url: string;
  source: string;
  score: number;
  /** The day it was first written for. */
  from: string;
}

const moved = (file: string, story: Story, from: string): Moved => ({ file, title: String(story.data.title ?? ''), url: String(story.data.url ?? ''), source: String(story.data.source ?? ''), score: score(story), from });

/** Print the held stories the day is owed, in its folder and under its date. Returns them as they now stand. */
export function release(day: string, options: HoldOptions): Moved[] {
  const { storiesDir = STORIES_DIR } = options;
  const dir = path.join(storiesDir, day);
  return dueToday(day, options).map((file) => {
    fs.mkdirSync(dir, { recursive: true });
    const match = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
    const doc = parseDocument(match[1]);
    const from = heldOn(file);
    doc.set('date', day);
    // Says the story has had its wait, so a later run of the day does not put it by again.
    doc.set('held_from', from);
    const number = Math.max(0, ...fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => parseInt(f, 10) || 0)) + 1;
    const to = path.join(dir, `${String(number).padStart(2, '0')}${path.basename(file).slice(14)}`);
    fs.writeFileSync(to, `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n${match[2]}`);
    fs.rmSync(file);
    return moved(to, { file: to, data: doc.toJS() as Record<string, unknown> }, from);
  });
}

/**
 * Put by what the day has over its number of stories, the lowest scored first. A story is never put by when it is
 * news of the day, has been held once already, or has had its picture drawn. Returns the stories put by.
 */
export function holdOver(day: string, options: HoldOptions): Moved[] {
  const { stories, never = [], storiesDir = STORIES_DIR, dataDir = DATA_DIR } = options;
  const today = read(path.join(storiesDir, day));
  const may = today
    .filter(({ data }) => !never.includes(String(data.section)) && data.held_from === undefined && data.figure_image === undefined)
    // The lowest scored goes first, and of two alike the one written later.
    .sort((a, b) => score(a) - score(b) || b.file.localeCompare(a.file));
  return may.slice(0, Math.max(0, today.length - stories)).map((story) => {
    const to = path.join(dataDir, HELD, `${day}--${path.basename(story.file)}`);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(story.file, to);
    return moved(to, story, day);
  });
}
