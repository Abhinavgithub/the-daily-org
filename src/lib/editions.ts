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
