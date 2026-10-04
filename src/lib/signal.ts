// Which stories an edition singles out. Decided by rank within the edition
// rather than by fixed score cut-offs, so every edition has a Must-read and a
// Recommended set however the scores happen to cluster.

export type Signal = 'must' | 'recommended' | 'other';

/** How many of an edition's stories, counted from the top of its ranking, earn each mark. */
export function signalsFor(count: number): { must: number; recommended: number } {
  if (count <= 0) return { must: 0, recommended: 0 };
  // The top two, but never more than a third of the edition: in a two-story
  // edition, marking both Must-read would say nothing.
  const must = Math.max(1, Math.min(2, Math.floor(count / 3)));
  // The top half, which includes the Must-read stories.
  const recommended = Math.max(must, Math.ceil(count / 2));
  return { must, recommended };
}

/** The mark for the story at `index` (0 is the best) in an edition of `count` stories. */
export function signalOf(index: number, count: number): Signal {
  const { must, recommended } = signalsFor(count);
  if (index < must) return 'must';
  return index < recommended ? 'recommended' : 'other';
}

/** What a story is ranked by. */
export interface Ranked {
  title: string;
  interest_score: number;
  depth_score: number;
  novelty_score: number;
  utility_score: number;
}

/** Sorts stories best first: by interest, then by depth, novelty and utility together, then by title. */
export function byRank(a: Ranked, b: Ranked): number {
  const total = (s: Ranked) => s.depth_score + s.novelty_score + s.utility_score;
  return b.interest_score - a.interest_score || total(b) - total(a) || a.title.localeCompare(b.title);
}
