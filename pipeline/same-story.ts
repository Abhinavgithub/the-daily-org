import fs from 'node:fs';
import path from 'node:path';
import { daysBetween } from './dedupe';
import { addAlso, openStory, readStories, removeStory, STORIES_DIR, storyText, type Also } from './write';

// Whether two pieces tell the same story, judged by their headlines, behind the editor's own judgement. The editor
// (the model) is asked of each new article whether it tells a story already in the edition again, and it can miss
// one: on 6 Nov it was shown "Agentforce Coworker adds Teams, mobile and desktop access and a $50 per-user price"
// and passed "Salesforce Agentforce Coworker: A $50 AI Teammate That Works Inside Teams" as new. Two tellings of
// one announcement share most of their headline's words; two pieces on one subject share some. Measured on the
// archive on 8 Nov, the stories printed twice shared 67% to 91% of the shorter headline's words, and the closest
// pair of different stories 55%.

/** Words that say nothing of what a piece is about, in this paper. */
const STOP = new Set(
  'a an the and or of to in on for with by at from as is are be it its this that how what why when your you new use using into about vs via can now more than salesforce org admin admins developer developers guide tip tips way ways step steps part'.split(
    ' ',
  ),
);

/** A headline's words that say what it is about: lower case, a plural as its singular, a price such as "$50" kept whole. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}$]+/gu, ' ')
    .split(' ')
    .filter((word) => word && !STOP.has(word))
    .map((word) => (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word));
}

const NUMBERS: Record<string, string> = { one: '1', two: '2', three: '3', four: '4', five: '5', i: '1', ii: '2', iii: '3', iv: '4', v: '5' };
/** The part of a series a headline names, as a number: "part two" and "Part 2" are both "2". */
export function partOf(text: string): string | undefined {
  const named = text.toLowerCase().match(/\bpart\s+(\d+|one|two|three|four|five|iii|ii|iv|v|i)\b/)?.[1];
  return named && (NUMBERS[named] ?? named);
}

/** A piece by its headlines: the paper's, and the article's own when it has one. */
export interface Telling {
  title: string;
  original?: string;
}

/** The share of the shorter headline's words the other has, at least, for two pieces to be one story. */
export const SAME_SHARE = 0.6;
/** And how many words they must share, so two short headlines are not one story by two words. */
export const SAME_WORDS = 5;

/** How alike two headlines are: the words they share, and their share of the shorter one's. */
function compare(a: string, b: string): { shared: string[]; share: number } {
  const one = new Set(words(a));
  const other = new Set(words(b));
  const shared = [...one].filter((word) => other.has(word));
  return { shared, share: shared.length / Math.max(1, Math.min(one.size, other.size)) };
}

/**
 * How alike two pieces are: the closest of their headlines, the paper's and the article's own, each against each.
 * They are compared a pair at a time, not pooled, as two articles' own titles can say the same thing in other words
 * than the paper's headlines do, and pooled they would only dilute each other.
 */
export function likeness(a: Telling, b: Telling): { shared: string[]; share: number } {
  const titles = (telling: Telling) => [telling.title, ...(telling.original ? [telling.original] : [])];
  const pairs = titles(a).flatMap((one) => titles(b).map((other) => compare(one, other)));
  // The closest pair that shares enough words, or failing that the closest.
  return pairs.sort((x, y) => Number(y.shared.length >= SAME_WORDS) - Number(x.shared.length >= SAME_WORDS) || y.share - x.share)[0];
}

/** Whether two pieces tell the same story. Two parts of one series never do. */
export function sameStory(a: Telling, b: Telling): boolean {
  const parts = [a, b].map((telling) => partOf(`${telling.title} ${telling.original ?? ''}`));
  if (parts[0] && parts[1] && parts[0] !== parts[1]) return false;
  const { shared, share } = likeness(a, b);
  return shared.length >= SAME_WORDS && share >= SAME_SHARE;
}

/** The first of `others` that tells the same story as `piece`, by its place in the list, or undefined. */
export function sameAs(piece: Telling, others: Telling[]): number | undefined {
  const at = others.findIndex((other) => sameStory(piece, other));
  return at < 0 ? undefined : at;
}

// Folding an edition's repeats ------------------------------------------------------------------------------------

/** Days back a story is looked for, so one printed this week is not printed again. */
export const RECENT_DAYS = 7;

type Story = ReturnType<typeof readStories>[number];

const telling = (story: Story): Telling => ({ title: String(story.data.title ?? ''), original: typeof story.data.original_title === 'string' ? story.data.original_title : undefined });
const score = (story: Story) => (typeof story.data.interest_score === 'number' ? story.data.interest_score : 0);
/** A story as the line it becomes under another telling. */
const told = (story: Story): Also => ({ title: telling(story).original ?? telling(story).title, url: String(story.data.url ?? ''), source: String(story.data.source ?? '') });
const alsoOf = (story: Story): Also[] => (Array.isArray(story.data.also) ? (story.data.also as Also[]) : []);

export interface Folded {
  /** The story taken out, and the one it is now a line under. */
  title: string;
  url: string;
  into: { title: string; file: string; day: string };
}

/**
 * Print each story of the day once. A story of the day that tells one printed in the week before becomes a line
 * under that one; of two stories of the day that tell one story, the higher scored stays (the first written, when
 * they score alike) and the other becomes a line under it. The lines a folded story had go with it. Returns what
 * was folded, in the order it was. A folded story's picture, when it does not go over, is deleted from `publicDir`.
 */
export function foldRepeats(day: string, storiesDir = STORIES_DIR, recentDays = RECENT_DAYS, publicDir = path.join(process.cwd(), 'public')): Folded[] {
  const recent = fs.existsSync(storiesDir)
    ? fs
        .readdirSync(storiesDir)
        .filter((other) => /^\d{4}-\d{2}-\d{2}$/.test(other) && other < day && daysBetween(other, day) <= recentDays)
        .sort()
        .reverse()
        .flatMap((other) => readStories(path.join(storiesDir, other)).map((story) => ({ story, day: other })))
    : [];
  const folded: Folded[] = [];
  const fold = (story: Story, into: Story, intoDay: string) => {
    for (const line of [told(story), ...alsoOf(story)]) addAlso(into.file, line);
    into.data.also = [...alsoOf(into), told(story), ...alsoOf(story)];
    // A picture already drawn is not thrown away: the story it was drawn for is the same one, so it goes over with
    // its diagram to a telling that has none.
    if (typeof story.data.figure_image === 'string' && into.data.figure_image === undefined) {
      const opened = openStory(fs.readFileSync(into.file, 'utf8'))!;
      opened.doc.set('figure', story.data.figure);
      opened.doc.set('figure_image', story.data.figure_image);
      fs.writeFileSync(into.file, storyText(opened.doc, opened.body));
      into.data.figure = story.data.figure;
      into.data.figure_image = story.data.figure_image;
      fs.rmSync(story.file);
    } else {
      removeStory(story.file, publicDir);
    }
    folded.push({ title: telling(story).title, url: told(story).url, into: { title: telling(into).title, file: into.file, day: intoDay } });
  };

  let today = readStories(path.join(storiesDir, day));
  // Told this week already: the earlier telling keeps it.
  for (const story of today) {
    const at = sameAs(telling(story), recent.map(({ story: other }) => telling(other)));
    if (at !== undefined) fold(story, recent[at].story, recent[at].day);
  }
  today = today.filter((story) => fs.existsSync(story.file));
  // Told twice today: the better telling keeps it.
  for (let i = 0; i < today.length; i++) {
    for (let j = i + 1; j < today.length; j++) {
      const [a, b] = [today[i], today[j]];
      if (!fs.existsSync(a.file) || !fs.existsSync(b.file) || !sameStory(telling(a), telling(b))) continue;
      const [keep, drop] = score(b) > score(a) ? [b, a] : [a, b];
      fold(drop, keep, day);
    }
  }
  return folded;
}
