import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupEditions, isBrief } from './editions';

test('a close call is printed in brief, and nothing else is', () => {
  assert.equal(isBrief({ relevant: true, interest_score: 5 }, 6), true);
  assert.equal(isBrief({ relevant: true, interest_score: 6 }, 6), false, 'that is a story');
  assert.equal(isBrief({ relevant: true, interest_score: 4 }, 6), false, 'too far short');
  assert.equal(isBrief({ relevant: false, interest_score: 5 }, 6), false, 'not relevant is never printed');
  assert.equal(isBrief({ relevant: true, interest_score: 7 }, 8), true, 'the bar moves with the threshold');
});

test('a day with only briefs is an edition, and editions run newest first', () => {
  const item = (date: string, n: number) => ({ data: { date, n } });
  const byN = (a: { data: { n: number } }, b: { data: { n: number } }) => b.data.n - a.data.n;
  const editions = groupEditions(
    [item('2026-10-04', 1), item('2026-10-04', 3), item('2026-10-06', 2)],
    [item('2026-10-05', 1), item('2026-10-05', 2), item('2026-10-04', 9)],
    { stories: byN, briefs: byN },
  );
  assert.deepEqual(editions.map((e) => [e.day, e.stories.map((s) => s.data.n), e.briefs.map((b) => b.data.n)]), [
    ['2026-10-06', [2], []],
    ['2026-10-05', [], [2, 1]],
    ['2026-10-04', [3, 1], [9]],
  ]);
  assert.deepEqual(groupEditions([], [], { stories: byN, briefs: byN }), []);
});
