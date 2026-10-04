import assert from 'node:assert/strict';
import { test } from 'node:test';
import { byRank, signalOf, signalsFor } from './signal';

test('how many stories each edition singles out', () => {
  const table: [number, number, number][] = [
    [0, 0, 0],
    [1, 1, 1],
    [2, 1, 1],
    [3, 1, 2],
    [4, 1, 2],
    [5, 1, 3],
    [6, 2, 3],
    [10, 2, 5],
    [20, 2, 10],
  ];
  for (const [count, must, recommended] of table) {
    assert.deepEqual(signalsFor(count), { must, recommended }, `${count} stories`);
  }
});

test('marks follow rank, and Recommended always contains Must-read', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map((i) => signalOf(i, 6)), ['must', 'must', 'recommended', 'other', 'other', 'other']);
  assert.deepEqual([0, 1].map((i) => signalOf(i, 2)), ['must', 'other']);
  for (let count = 1; count <= 40; count++) {
    const { must, recommended } = signalsFor(count);
    assert.ok(must >= 1 && must <= 2 && recommended >= must && recommended <= count, `${count} stories`);
  }
});

test('stories rank by interest, then by the other scores together, then by title', () => {
  const story = (title: string, interest: number, rest: number) => ({ title, interest_score: interest, depth_score: rest, novelty_score: 5, utility_score: 5 });
  const ranked = [story('C', 7, 5), story('B', 8, 5), story('A', 7, 9), story('D', 7, 5)].sort(byRank);
  assert.deepEqual(ranked.map((s) => s.title), ['B', 'A', 'C', 'D']);
});
