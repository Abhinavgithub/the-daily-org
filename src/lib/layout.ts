// How wide each story is set on a three-column page. Width comes from the
// story, so the page's shape follows the news rather than a fixed template.
// Height is not decided here: a box is as tall as its own text.

/** Columns occupied, out of three. */
export type Span = 1 | 2 | 3;

export const COLUMNS = 3;
/** A story this good takes the full width of the page. */
const FULL_WIDTH_SCORE = 9;
/** A story this good takes two columns. */
const WIDE_SCORE = 8;
/** An edition needs this many stories before its top story is widened for want of a standout. */
const MIN_FOR_LEAD = 4;

/**
 * The width of each story beneath an edition's lead, in a body of so many columns, given their interest scores
 * in rank order. The lead has the banner across the top of the page, so no story here is widened for want of
 * a lead, and none is wider than the body.
 */
export function bodySpans(interests: number[], columns: 2 | 3): Span[] {
  return interests.map((score) => Math.min(columns, score >= FULL_WIDTH_SCORE ? 3 : score >= WIDE_SCORE ? 2 : 1) as Span);
}

/**
 * The width of each story, given the interest scores of an edition's stories
 * in rank order (best first). When no story scores high enough to earn a wide
 * box, the top story of a full enough edition takes two columns, so the page
 * still has a lead.
 */
export function storySpans(interests: number[]): Span[] {
  const spans = interests.map((score): Span => (score >= FULL_WIDTH_SCORE ? 3 : score >= WIDE_SCORE ? 2 : 1));
  if (spans.length >= MIN_FOR_LEAD && spans.every((span): boolean => span === 1)) spans[0] = 2;
  return spans;
}
