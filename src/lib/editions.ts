// What the paper prints on a day. A day is an edition when it has stories, or
// only briefs: the close calls that did not make a story.

/** The most briefs an edition prints. */
export const MAX_BRIEFS = 6;

/**
 * Whether a reviewed article is printed in brief: judged relevant, and one
 * point short of the score a story needs.
 */
export const isBrief = (verdict: { relevant: boolean; interest_score: number }, threshold: number) =>
  verdict.relevant && verdict.interest_score === threshold - 1;

interface Dated {
  data: { date: string };
}

/**
 * Stories and briefs gathered into editions, newest first. `rank` orders the
 * items of a day, best first.
 */
export function groupEditions<S extends Dated, B extends Dated>(
  stories: S[],
  briefs: B[],
  rank: { stories: (a: S, b: S) => number; briefs: (a: B, b: B) => number },
): { day: string; stories: S[]; briefs: B[] }[] {
  const days = new Map<string, { day: string; stories: S[]; briefs: B[] }>();
  const on = (day: string) => {
    if (!days.has(day)) days.set(day, { day, stories: [], briefs: [] });
    return days.get(day)!;
  };
  for (const story of stories) on(story.data.date).stories.push(story);
  for (const brief of briefs) on(brief.data.date).briefs.push(brief);
  return [...days.values()]
    .map((edition) => ({ ...edition, stories: edition.stories.sort(rank.stories), briefs: edition.briefs.sort(rank.briefs) }))
    .sort((a, b) => b.day.localeCompare(a.day));
}

/**
 * A story's reason to read split for the page: its first sentence, printed as
 * the deck under the headline, and the rest, if any, kept for the "why read
 * this" note. A full stop counts as the end of a sentence only when a capital
 * follows, so "e.g. an org" or "v2.1" does not cut it short.
 */
export function deck(why: string): { deck: string; rest: string } {
  const text = why.trim();
  const end = /[.!?]["'”’)]*(?=\s+["'“‘(]?\p{Lu})/u.exec(text);
  if (!end) return { deck: text, rest: '' };
  const cut = end.index + end[0].length;
  return { deck: text.slice(0, cut), rest: text.slice(cut).trim() };
}

const ROMAN: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
const roman = (n: number) => ROMAN.reduce((out, [value, mark]) => { let s = out; while (n >= value) { s += mark; n -= value; } return s; }, '');

/**
 * The folio line's volume and number, as a printed paper counts them: the
 * number is the edition's place among all editions, the first being No. 1, and
 * the volume goes up by one on each anniversary of the first edition.
 * `days` is every edition's day, in any order. Undefined for a day that is not among them.
 */
export function folio(day: string, days: string[]): { volume: string; number: number } | undefined {
  const sorted = [...new Set(days)].sort();
  const at = sorted.indexOf(day);
  if (at < 0) return undefined;
  const [y0, m0, d0] = sorted[0].split('-').map(Number);
  const [y, m, d] = day.split('-').map(Number);
  const years = y - y0 - (m < m0 || (m === m0 && d < d0) ? 1 : 0);
  return { volume: roman(years + 1), number: at + 1 };
}
