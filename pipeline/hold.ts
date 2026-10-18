import fs from 'node:fs';
import path from 'node:path';
import { daysBetween } from './dedupe';
import { openStory, readStories, STORIES_DIR, storyText } from './write';

// A full day's surplus is kept for a quiet one. Sources post on weekdays and hardly at all at the weekend, so
// without this a day of eight stories is followed by days of none. A held story is a story file as it was
// written, kept out of the paper in data/held/ until there is room for it. A day's own stories come first: a held
// story fills the room a day has, and one that has waited its days is printed then whatever the day holds, on top of
// the day's own, so a busy week neither loses a story nor makes the rest late.

/** Read with `readEdition('held', DATA_DIR)`, so a held story can be told again like any printed one. */
export const DATA_DIR = path.join(process.cwd(), 'data');
export const HELD = 'held';
/** Days a story may be held. One that has found no room by then is printed that day, in full, whatever the day holds. */
export const HOLD_DAYS = 3;

export interface HoldOptions {
  /** The most stories a day prints while there is anything to hold. */
  stories: number;
  /** Sections whose stories are never held, because they are news of the day. */
  never?: readonly string[];
  storiesDir?: string;
  dataDir?: string;
}

type Story = ReturnType<typeof readStories>[number];

const score = (story: Story) => (typeof story.data.interest_score === 'number' ? story.data.interest_score : 0);
/** The day a held story was put by, which its file is named for. */
const heldOn = (file: string) => path.basename(file).slice(0, 10);

/** Whether a story in the day's folder was printed there for having waited its days, and so is not counted against the day's number. */
const late = (story: Story, day: string) => typeof story.data.held_from === 'string' && daysBetween(story.data.held_from, day) >= HOLD_DAYS;

/** The day's own stories, as counted against its number: not those printed for having waited their days. */
const counted = (day: string, storiesDir: string) => readStories(path.join(storiesDir, day)).filter((story) => !late(story, day));

/**
 * What the day owes the held stories: those that have waited their days, printed whatever the day holds, and as many
 * of the others as it has room for, the longest held first and then the best. One held that day is not printed that day.
 */
function owing(day: string, options: HoldOptions): Story[] {
  const { stories, storiesDir = STORIES_DIR, dataDir = DATA_DIR } = options;
  const waiting = readStories(path.join(dataDir, HELD))
    .filter((story) => heldOn(story.file) !== day)
    .sort((a, b) => heldOn(a.file).localeCompare(heldOn(b.file)) || score(b) - score(a));
  const due = waiting.filter((story) => daysBetween(heldOn(story.file), day) >= HOLD_DAYS);
  const room = Math.max(0, stories - counted(day, storiesDir).length);
  return [...due, ...waiting.filter((story) => !due.includes(story)).slice(0, room)];
}

/** The held stories the day would print. */
export const dueToday = (day: string, options: HoldOptions): string[] => owing(day, options).map((story) => story.file);

export interface Moved {
  /** Where the story is now. */
  file: string;
  title: string;
  url: string;
  source: string;
  score: number;
  /** The day it was first written for. */
  from: string;
  /** Printed for having waited its days, not because the day had room. */
  late?: boolean;
}

const moved = (file: string, story: Story, from: string): Moved => ({ file, title: String(story.data.title ?? ''), url: String(story.data.url ?? ''), source: String(story.data.source ?? ''), score: score(story), from });

/** Print the held stories the day owes, in its folder and under its date. Returns them as they now stand. */
export function release(day: string, options: HoldOptions): Moved[] {
  const { storiesDir = STORIES_DIR } = options;
  const dir = path.join(storiesDir, day);
  return owing(day, options).map(({ file }) => {
    fs.mkdirSync(dir, { recursive: true });
    const { doc, body } = openStory(fs.readFileSync(file, 'utf8'))!;
    const from = heldOn(file);
    doc.set('date', day);
    // Says the story has had its wait, so a later run of the day does not put it by again.
    doc.set('held_from', from);
    const number = Math.max(0, ...fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => parseInt(f, 10) || 0)) + 1;
    const to = path.join(dir, `${String(number).padStart(2, '0')}${path.basename(file).slice(14)}`);
    fs.writeFileSync(to, storyText(doc, body));
    fs.rmSync(file);
    return { ...moved(to, { file: to, data: doc.toJS() as Record<string, unknown> }, from), late: daysBetween(from, day) >= HOLD_DAYS };
  });
}

/**
 * Put by what the day has over its number of stories, the lowest scored first. A story is never put by when it is
 * news of the day, has been held once already, or has had its picture drawn; one printed for having waited its days
 * does not count against the number. Returns the stories put by.
 */
export function holdOver(day: string, options: HoldOptions): Moved[] {
  const { stories, never = [], storiesDir = STORIES_DIR, dataDir = DATA_DIR } = options;
  const today = counted(day, storiesDir);
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
