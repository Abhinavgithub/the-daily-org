import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deck, folio, groupEditions, isBrief } from './editions';

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

test("a story's deck is the first sentence of its reason to read", () => {
  assert.deepEqual(deck('You will learn X. It closes a series.'), { deck: 'You will learn X.', rest: 'It closes a series.' });
  assert.deepEqual(deck('You will learn X.'), { deck: 'You will learn X.', rest: '' }, 'one sentence: nothing left over');
  assert.deepEqual(deck('  You will learn X  '), { deck: 'You will learn X', rest: '' });
  assert.equal(deck('You will see e.g. an org on v2.1 work. Then more.').deck, 'You will see e.g. an org on v2.1 work.', 'a stop without a capital after it');
  assert.equal(deck('Is it worth it? Yes, for admins.').deck, 'Is it worth it?');
  assert.deepEqual(deck('It says "Use Flow." It then waits.'), { deck: 'It says "Use Flow."', rest: 'It then waits.' }, 'the closing quote stays with its sentence');
});

test('an edition is numbered from the first, and its volume goes up each year', () => {
  const days = ['2026-10-05', '2026-10-03', '2026-10-04', '2027-10-02', '2027-10-03', '2028-12-01'];
  assert.deepEqual(folio('2026-10-03', days), { volume: 'I', number: 1 });
  assert.deepEqual(folio('2026-10-05', days), { volume: 'I', number: 3 }, 'in any order');
  assert.deepEqual(folio('2027-10-02', days), { volume: 'I', number: 4 }, 'the day before the anniversary');
  assert.deepEqual(folio('2027-10-03', days), { volume: 'II', number: 5 }, 'the anniversary itself');
  assert.deepEqual(folio('2028-12-01', days), { volume: 'III', number: 6 });
  assert.equal(folio('2026-01-01', days), undefined);
  assert.equal(folio('2026-10-03', [...days, '2026-10-03'])?.number, 1, 'a day listed twice counts once');
});
