import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pack, type Box, type Packed } from './pack';

const GAP = 24;
const single = (height: number, heightWide?: number): Box => ({ span: 1, height, heightWide });
const wide = (height: number, span = 2): Box => ({ span, height });
const spreadOf = (packed: Packed) => Math.max(...packed.bottoms) - Math.min(...packed.bottoms);

/** No two boxes share any space, and no box is closer than the gap to the one above it. */
function assertSound(packed: Packed, gap = GAP) {
  const boxes = packed.placements;
  boxes.forEach((a, i) => {
    assert.ok(a, `box ${i} was placed`);
    boxes.forEach((b, j) => {
      if (j <= i) return;
      const shareColumn = a.column < b.column + b.span && b.column < a.column + a.span;
      if (!shareColumn) return;
      const [upper, lower] = a.top <= b.top ? [a, b] : [b, a];
      assert.ok(lower.top - (upper.top + upper.height) >= gap - 0.001, `boxes ${i} and ${j} keep the gap`);
    });
  });
}

/** The gaps between neighbours in a column, in order. */
function gapsIn(packed: Packed, column: number): number[] {
  const boxes = packed.placements.filter((p) => p.column <= column && column < p.column + p.span).sort((a, b) => a.top - b.top);
  return boxes.slice(1).map((box, i) => box.top - (boxes[i].top + boxes[i].height));
}

// The real boxes of the two editions, measured at desktop width.
const oct4 = [wide(573), ...[1409, 1496, 1256, 1249, 883, 1230, 1614, 1125].map((h) => single(h))];
const oct3 = [wide(616), ...[789, 1374, 1411, 1088, 909].map((h) => single(h))];

test('the real editions end far more evenly than by filling the shortest column in turn', () => {
  // Before: columns ended 972 px apart on 4 October and 823 px apart on 3 October.
  const a = pack(oct4, 3, GAP);
  assertSound(a);
  assert.ok(spreadOf(a) <= 205, `4 October: ${spreadOf(a)} px apart`);
  assert.ok(a.height <= 3940, `4 October is ${a.height} px long`);

  const b = pack(oct3, 3, GAP);
  assertSound(b);
  assert.ok(spreadOf(b) <= 435, `3 October: ${spreadOf(b)} px apart`);
});

test('a wide story stays at the top, and the rest is divided beneath it', () => {
  const packed = pack(oct4, 3, GAP);
  assert.deepEqual({ ...packed.placements[0] }, { column: 0, span: 2, top: 0, height: 573, widened: false });
  // The third column starts at the top; the two under the lead start below it.
  const tops = packed.placements.slice(1).map((p) => [p.column, p.top]);
  assert.ok(tops.some(([column, top]) => column === 2 && top === 0));
  assert.ok(tops.filter(([column]) => column < 2).every(([, top]) => top >= 573 + GAP));
});

test('within a column, stories stay in rank order', () => {
  for (const edition of [oct4, oct3]) {
    const { placements } = pack(edition, 3, GAP);
    for (let column = 0; column < 3; column++) {
      const inColumn = placements.map((p, rank) => ({ p, rank })).filter(({ p }) => p.span === 1 && p.column === column);
      const byTop = [...inColumn].sort((a, b) => a.p.top - b.p.top).map(({ rank }) => rank);
      assert.deepEqual(byTop, inColumn.map(({ rank }) => rank));
    }
  }
});

test('equal boxes divide exactly, with the best-ranked on top', () => {
  const packed = pack([single(300), single(300), single(300), single(300), single(300), single(300)], 3, GAP);
  assertSound(packed);
  assert.equal(spreadOf(packed), 0);
  assert.deepEqual(packed.placements.slice(0, 3).map((p) => p.top), [0, 0, 0], 'the three best start the columns');
});

test('a story at the foot goes wide only when that leaves clearly less blank', () => {
  // One long column and two short ones. The last story is 1000 px tall in one column, which
  // leaves one column 300 px short, but 650 px tall across the two short ones, which fills them.
  const helps = pack([single(1300), single(620), single(600), single(1000, 650)], 3, GAP);
  assertSound(helps);
  const widened = helps.placements.filter((p) => p.widened);
  assert.equal(widened.length, 1, 'one story is widened');
  assert.equal(widened[0].span, 2);
  assert.ok(spreadOf(helps) < 100, `ends ${spreadOf(helps)} px apart`);
  const beneath = helps.placements.filter((p) => !p.widened && p.column >= widened[0].column && p.column < widened[0].column + 2);
  assert.ok(beneath.every((p) => p.top + p.height <= widened[0].top), 'nothing in its columns lies below it');

  // Already even: nothing is widened.
  const even = pack([single(500, 280), single(500, 280), single(500, 280)], 3, GAP);
  assert.equal(even.placements.filter((p) => p.widened).length, 0);

  // No double-width height known: nothing can be widened.
  const unknown = pack([single(1200), single(600), single(600), single(1200)], 3, GAP);
  assert.equal(unknown.placements.filter((p) => p.widened).length, 0);
});

test('small differences are shared into the gaps, which never more than double', () => {
  // Columns of two boxes each, ending 10 and 20 px short: the one gap in each takes it up.
  const packed = pack([single(500), single(500), single(500), single(490), single(480), single(500)], 3, GAP);
  assertSound(packed);
  assert.equal(spreadOf(packed), 0, 'the columns end level');
  for (let column = 0; column < 3; column++) {
    for (const gap of gapsIn(packed, column)) assert.ok(gap >= GAP - 0.001 && gap <= 2 * GAP + 0.001, `gap of ${gap}`);
  }

  // A difference too big for the gaps is left rather than opening a hole.
  const uneven = pack([single(900), single(300), single(300)], 3, GAP);
  assertSound(uneven);
  assert.equal(spreadOf(uneven), 600);
});

test('two columns, one column and nothing at all', () => {
  const two = pack(oct4, 2, GAP);
  assertSound(two);
  assert.equal(two.placements[0].span, 2, 'the lead takes both columns');
  assert.ok(spreadOf(two) <= 150, `two columns end ${spreadOf(two)} px apart`);

  const one = pack([single(300), single(200), wide(400)], 1, GAP);
  assert.deepEqual(one.placements.map((p) => [p.column, p.span, p.top]), [[0, 1, 0], [0, 1, 324], [0, 1, 548]]);

  assert.deepEqual(pack([], 3, GAP), { placements: [], bottoms: [0, 0, 0], height: 0 });
});

test('many stories fall back to the fast rule and still end close together', () => {
  const heights = [900, 640, 1210, 780, 1500, 820, 990, 700, 1130, 860, 1040, 760, 1320, 880];
  const packed = pack(heights.map((h) => single(h)), 3, GAP);
  assertSound(packed);
  assert.ok(spreadOf(packed) <= 400, `ends ${spreadOf(packed)} px apart`);
});
