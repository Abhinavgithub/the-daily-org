// Arranging an edition's boxes into columns so that the columns end as close
// together as possible, and as little of the sheet as possible is left blank.
// Pure functions: the page measures the boxes, this decides where they go.

export interface Box {
  /** Columns the story is set across by its own merit: 1, 2 or 3. */
  span: number;
  /** Its height at that width. */
  height: number;
  /** For a one-column story: its height if it were set across two columns instead. */
  heightWide?: number;
}

export interface Placement {
  /** Leftmost column, counting from 0. */
  column: number;
  span: number;
  /** Distance from the top of the grid. */
  top: number;
  height: number;
  /** A one-column story set across two columns to close a gap at the foot of the page. */
  widened: boolean;
}

export interface Packed {
  placements: Placement[];
  /** Where each column's last box ends. */
  bottoms: number[];
  height: number;
}

/** Try every division of the stories among the columns up to this many; beyond it, use a fast rule. */
const EXHAUSTIVE_UP_TO = 10;
/** Arrangements within this much blank of the best are treated as equal, and rank decides between them. */
const NEAR_TIE = 60;
/** Widening a story at the foot must save at least this much blank to be worth breaking the width rule. */
const WORTH_WIDENING = 60;

/** One way of setting a group of one-column stories beneath whatever is above them. */
interface Plan {
  /** For each story, in rank order: the column it goes in, or -1 if it is the one set wide at the foot. */
  columns: number[];
  /** The story set wide at the foot, as an index into the group, and its leftmost column. */
  wide?: { index: number; column: number };
  /** Where each column would end (with the trailing gap). */
  ends: number[];
  /** Blank area in column-pixels: space below each column's end, plus any hole under a widened story. */
  blank: number;
  /** Lower is better: how far the better-ranked stories sit from the top. */
  disorder: number;
}

function evaluate(
  heights: number[],
  wides: (number | undefined)[],
  starts: number[],
  gap: number,
  columns: number[],
  wide?: { index: number; column: number },
): Plan {
  const ends = [...starts];
  let disorder = 0;
  const count = heights.length;
  columns.forEach((column, i) => {
    if (column < 0) return;
    // Better-ranked stories weigh more, so arrangements that keep them high score lower.
    disorder += (count - i) * ends[column];
    ends[column] += heights[i] + gap;
  });

  let hole = 0;
  if (wide) {
    const [a, b] = [wide.column, wide.column + 1];
    const top = Math.max(ends[a], ends[b]);
    hole = top - ends[a] + (top - ends[b]);
    disorder += (count - wide.index) * top;
    ends[a] = ends[b] = top + (wides[wide.index] ?? heights[wide.index]) + gap;
  }
  const foot = Math.max(...ends);
  const blank = ends.reduce((sum, end) => sum + (foot - end), 0) + hole;
  return { columns, wide, ends, blank, disorder };
}

/** Less blank wins; when two plans are about as even, the one that keeps better stories higher wins. */
const better = (a: Plan, b: Plan | undefined) =>
  !b || (Math.abs(a.blank - b.blank) <= NEAR_TIE ? a.disorder < b.disorder : a.blank < b.blank);

/** The best plan among every division of the stories, or by a fast rule when there are too many to try. */
function divide(
  heights: number[],
  wides: (number | undefined)[],
  starts: number[],
  gap: number,
  skip = -1,
  wide?: { index: number; column: number },
): Plan {
  const count = heights.length;
  const columnCount = starts.length;
  const free = heights.map((_, i) => i).filter((i) => i !== skip);

  if (free.length > EXHAUSTIVE_UP_TO) {
    // Tallest first, each into whichever column is shortest so far.
    const columns = new Array<number>(count).fill(-1);
    const ends = [...starts];
    for (const i of [...free].sort((a, b) => heights[b] - heights[a])) {
      const column = ends.indexOf(Math.min(...ends));
      columns[i] = column;
      ends[column] += heights[i] + gap;
    }
    // Then improve it: move one story, or swap two, for as long as that leaves less blank.
    let plan = evaluate(heights, wides, starts, gap, columns, wide);
    for (let improved = true; improved; ) {
      improved = false;
      const attempt = (next: number[]) => {
        const candidate = evaluate(heights, wides, starts, gap, next, wide);
        if (candidate.blank < plan.blank - 0.5) {
          plan = candidate;
          improved = true;
        }
      };
      for (const i of free) {
        for (let column = 0; column < columnCount; column++) {
          if (column === plan.columns[i]) continue;
          const moved = [...plan.columns];
          moved[i] = column;
          attempt(moved);
        }
        for (const j of free) {
          if (j <= i || plan.columns[i] === plan.columns[j]) continue;
          const swapped = [...plan.columns];
          [swapped[i], swapped[j]] = [swapped[j], swapped[i]];
          attempt(swapped);
        }
      }
    }
    return plan;
  }

  // The best blank first, then the best order among plans within a near tie of it.
  let least = Infinity;
  const candidates: Plan[] = [];
  const columns = new Array<number>(count).fill(-1);
  const walk = (position: number) => {
    if (position === free.length) {
      const plan = evaluate(heights, wides, starts, gap, [...columns], wide);
      least = Math.min(least, plan.blank);
      if (plan.blank <= least + NEAR_TIE) candidates.push(plan);
      return;
    }
    for (let column = 0; column < columnCount; column++) {
      columns[free[position]] = column;
      walk(position + 1);
    }
  };
  walk(0);
  return candidates
    .filter((plan) => plan.blank <= least + NEAR_TIE)
    .reduce((best, plan) => (plan.disorder < best.disorder ? plan : best));
}

/**
 * Lay the boxes out, given in rank order, in `columnCount` columns with `gap`
 * between them.
 *
 * - A story wider than one column sits at the top of its part of the page; the
 *   one-column stories that follow it are divided among the columns beneath.
 * - Within a column, stories stay in rank order.
 * - At the foot of the page, one story may be set across two columns if that
 *   leaves clearly less blank.
 * - Whatever small difference is left is shared into the gaps of the shorter
 *   columns, each gap growing to at most twice its size.
 */
export function pack(boxes: Box[], columnCount: number, gap: number): Packed {
  const placements = new Array<Placement>(boxes.length);
  // Where the next box in each column would start.
  let starts = new Array<number>(columnCount).fill(0);

  // Split into parts: each wide story begins one, followed by the one-column stories after it.
  const parts: { head?: number; rest: number[] }[] = [{ rest: [] }];
  boxes.forEach((box, i) => {
    if (Math.min(box.span, columnCount) > 1) parts.push({ head: i, rest: [] });
    else parts.at(-1)!.rest.push(i);
  });

  parts.forEach((part, partIndex) => {
    if (part.head !== undefined) {
      const box = boxes[part.head];
      const span = Math.min(box.span, columnCount);
      // Across the neighbouring columns that are free soonest.
      let column = 0;
      let top = Infinity;
      for (let c = 0; c + span <= columnCount; c++) {
        const at = Math.max(...starts.slice(c, c + span));
        if (at < top) [column, top] = [c, at];
      }
      placements[part.head] = { column, span, top, height: box.height, widened: false };
      for (let c = column; c < column + span; c++) starts[c] = top + box.height + gap;
    }
    if (part.rest.length === 0) return;

    const heights = part.rest.map((i) => boxes[i].height);
    const wides = part.rest.map((i) => boxes[i].heightWide);
    let plan = divide(heights, wides, starts, gap);

    // At the foot of the page only: would one story set across two columns leave less blank?
    const last = partIndex === parts.length - 1;
    if (last && columnCount >= 2 && part.rest.length >= 2 && part.rest.length <= EXHAUSTIVE_UP_TO) {
      let widened: Plan | undefined;
      part.rest.forEach((boxIndex, index) => {
        if (boxes[boxIndex].heightWide === undefined) return;
        for (let column = 0; column + 2 <= columnCount; column++) {
          const candidate = divide(heights, wides, starts, gap, index, { index, column });
          if (better(candidate, widened)) widened = candidate;
        }
      });
      if (widened && widened.blank < plan.blank - WORTH_WIDENING) plan = widened;
    }

    // Set the boxes down column by column.
    const cursor = [...starts];
    const inColumn: number[][] = Array.from({ length: columnCount }, () => []);
    plan.columns.forEach((column, i) => {
      if (column < 0) return;
      const boxIndex = part.rest[i];
      placements[boxIndex] = { column, span: 1, top: cursor[column], height: heights[i], widened: false };
      cursor[column] += heights[i] + gap;
      inColumn[column].push(boxIndex);
    });

    // Each gap in a column may be opened to at most twice its size. A column's
    // gaps are those between its boxes, and the one above its first box when
    // something lies above it.
    const used = new Array<number>(columnCount).fill(0);
    const gapCount = (c: number) => (inColumn[c].length ? inColumn[c].length - 1 + (starts[c] > 0 ? 1 : 0) : 0);
    const room = (c: number) => gapCount(c) * gap - used[c];
    /** Open a column's gaps by `amount` in total, shared equally, moving its boxes down. */
    const open = (c: number, amount: number) => {
      const gaps = gapCount(c);
      if (amount <= 0 || gaps === 0) return;
      const each = amount / gaps;
      let shift = 0;
      inColumn[c].forEach((boxIndex, i) => {
        if (i > 0 || starts[c] > 0) shift += each;
        placements[boxIndex].top += shift;
      });
      used[c] += amount;
      cursor[c] += amount;
    };

    if (plan.wide) {
      const { index, column } = plan.wide;
      const pair = [column, column + 1];
      // Close the hole above the wide story by opening the gaps of the shorter column, as far as they go.
      const top = Math.max(...pair.map((c) => cursor[c]));
      for (const c of pair) open(c, Math.min(top - cursor[c], room(c)));
      const height = wides[index] ?? heights[index];
      placements[part.rest[index]] = { column, span: 2, top, height, widened: true };
      for (const c of pair) cursor[c] = top + height + gap;
    }

    // Share out what is left, so the columns end level where the gaps allow.
    if (last) {
      const foot = Math.max(...cursor);
      const pair = plan.wide ? [plan.wide.column, plan.wide.column + 1] : [];
      for (let c = 0; c < columnCount; c++) {
        if (!pair.includes(c)) open(c, Math.min(foot - cursor[c], room(c)));
      }
      if (plan.wide) {
        // The two columns under the wide story move together, by what both can absorb.
        const shift = Math.min(foot - cursor[pair[0]], ...pair.map(room));
        if (shift > 0) {
          for (const c of pair) open(c, shift);
          placements[part.rest[plan.wide.index]].top += shift;
        }
      }
    }
    starts = cursor;
  });

  const bottoms = new Array<number>(columnCount).fill(0);
  for (const p of placements) {
    for (let c = p.column; c < p.column + p.span; c++) bottoms[c] = Math.max(bottoms[c], p.top + p.height);
  }
  return { placements, bottoms, height: Math.max(0, ...bottoms) };
}
