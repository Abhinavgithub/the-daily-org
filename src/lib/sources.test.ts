import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addedOn, addTallies, emptyTally, postsByDay, readTallies, scorecard, standings, verdict, type SourceTally } from './sources';

const NOW = Date.parse('2026-10-04T12:00:00Z');
const tally = (over: Partial<ReturnType<typeof emptyTally>>) => ({ ...emptyTally(), ...over });

test("a run's record of its sources is read leniently and added up", () => {
  const one = readTallies({ a: { items: 9, new: 6, reviewed: 6, published: 5, below: 1, scores: [8, 7, 'x'], tokens: 100 }, b: null, c: 'no' });
  assert.deepEqual(Object.keys(one), ['a']);
  assert.deepEqual(one.a.scores, [8, 7]);
  assert.deepEqual(readTallies(undefined), {});
  assert.deepEqual(readTallies([1]), {});

  const two = readTallies({ a: { items: 9, new: 2, reviewed: 2, published: 1, scores: [6, 5], tokens: 40 } });
  const sum = addTallies([one, two]).a;
  // The second run was offered the same nine items again; only the new ones count.
  assert.deepEqual([sum.items, sum.new, sum.reviewed, sum.published, sum.tokens], [8, 8, 8, 6, 140]);
  assert.deepEqual(sum.scores, [8, 7, 6, 5]);
});

test('each verdict has its rule, and the most pressing comes first', () => {
  const says = (t: Partial<ReturnType<typeof emptyTally>>, feed = {}) => verdict(tally(t), feed, NOW);

  assert.equal(says({ new: 10, reviewed: 10, published: 8 }).standing, 'strong');
  assert.equal(says({ new: 10, reviewed: 10, published: 4 }).standing, 'keep');
  assert.equal(says({ new: 10, reviewed: 10, published: 2 }).standing, 'low');
  assert.equal(says({ new: 3, reviewed: 3, published: 3 }).standing, 'new', 'too few reviewed to call it strong');
  assert.equal(says({ new: 7, reviewed: 7, published: 1 }).standing, 'keep', 'too few reviewed to call it low');

  const unreadable = says({ new: 10, unread: 8, dropped: 2 });
  assert.equal(unreadable.standing, 'unreadable');
  assert.match(unreadable.says, /10 of 10 never reached review/);
  assert.equal(says({ new: 10, dropped: 5, reviewed: 5, published: 4 }).standing, 'strong', 'half dropped is not unreadable');
  assert.equal(says({ new: 2, unread: 2 }).standing, 'new', 'two items are too few to say');

  const quiet = says({}, { lastPostAt: '2025-11-09T00:00:00Z' });
  assert.deepEqual([quiet.standing, quiet.says, quiet.look], ['quiet', 'Quiet for 11 months', true]);
  assert.equal(says({}, { lastPostAt: '2026-09-20T00:00:00Z' }).standing, 'new', 'two weeks is not quiet');
  assert.equal(says({}, { lastPostAt: '2026-08-26T12:00:00Z' }).says, 'Quiet for 39 days', 'a month is, in a daily paper');
  assert.equal(says({}, { lastPostAt: '2024-01-01T00:00:00Z' }).says, 'Quiet for over a year');

  // A failing feed is said to be failing, whatever else is true of it.
  assert.equal(says({ new: 10, reviewed: 10, published: 9 }, { failures: 3, lastPostAt: '2025-01-01T00:00:00Z' }).standing, 'failing');
  assert.equal(says({ new: 10, reviewed: 10, published: 9 }, { failures: 2 }).standing, 'strong');
});

test('the scorecard has every source of the paper, the strongest first', () => {
  const rows = scorecard(
    [
      { id: 'quiet', name: 'Quiet' },
      { id: 'strong', name: 'Strong' },
      { id: 'unknown', name: 'Unknown' },
      { id: 'low', name: 'Low' },
    ],
    {
      strong: tally({ new: 10, reviewed: 10, published: 8, scores: [8, 7, 7], tokens: 80000 }),
      low: tally({ new: 9, reviewed: 9, published: 1, scores: [4], tokens: 30000 }),
      gone: tally({ new: 5, reviewed: 5, published: 5 }),
    },
    { quiet: { lastPostAt: '2026-02-01T00:00:00Z' } },
    NOW,
  );
  assert.deepEqual(rows.map((row) => row.id), ['strong', 'unknown', 'low', 'quiet'], 'a source no longer in the paper is left out');
  assert.deepEqual([rows[0].yield, rows[0].averageScore, rows[0].tokensPerStory], [80, 7.3, 10000]);
  assert.deepEqual([rows[1].yield, rows[1].averageScore, rows[1].tokensPerStory], [undefined, undefined, undefined]);
  assert.equal(rows.filter((row) => row.verdict.look).length, 2);
  assert.equal(standings(rows), '4 sources: 2 need a look, 1 strong, 1 new or too few to say.');
  assert.equal(standings(rows.slice(0, 1)), '1 source: none needs a look, 1 strong.');
});

test('a forum is not judged on its yield, as most of its posts are turned away by design', () => {
  const quiet = { ...emptyTally(), new: 140, reviewed: 140, published: 3 };
  assert.equal(verdict(quiet).standing, 'low');
  assert.equal(verdict(quiet).says, 'Low yield · 3 of 140 printed');
  assert.deepEqual(verdict(quiet, {}, Date.now(), { kind: 'forum' }), { standing: 'keep', says: 'Answers · 3 Bulletin lines', look: false });
  assert.deepEqual(verdict(quiet, {}, Date.now(), { kind: 'tool' }), { standing: 'keep', says: 'Answers · every release printed', look: false });
  // A forum that keeps failing is still said to be failing.
  assert.equal(verdict(quiet, { failures: 3 }, Date.now(), { kind: 'forum' }).standing, 'failing');
});

test('a source just added is new, and is not called quiet before it has had the time', () => {
  const now = Date.parse('2026-10-17T12:00:00Z');
  assert.deepEqual(verdict(emptyTally(), { lastPostAt: '2026-09-24T00:00:00Z' }, now, { since: '2026-10-08' }), { standing: 'new', says: 'New since 8 Oct, no post yet', look: false });
  assert.equal(verdict({ ...emptyTally(), new: 4, reviewed: 4, published: 4 }, {}, now, { since: '2026-10-08' }).says, 'New since 8 Oct');
  // Two weeks on, it is judged like any other.
  assert.equal(verdict({ ...emptyTally(), new: 4, reviewed: 4, published: 4 }, {}, now, { since: '2026-10-01' }).says, 'Too few to say');
  assert.equal(verdict({ ...emptyTally(), new: 10, reviewed: 10, published: 4 }, {}, now).says, 'Keep · 40% printed');
});

test('the day each source was added, and its new posts by day, are read from the runs', () => {
  const tally = (n: number) => ({ ...emptyTally(), new: n });
  const runs: { date: string; sources: Record<string, SourceTally> }[] = [
    { date: '2026-10-04', sources: { a: tally(2), b: tally(0) } },
    { date: '2026-10-08', sources: { a: tally(1), b: tally(3), c: tally(1) } },
    { date: '2026-10-08', sources: { a: tally(1) } },
    { date: '2026-10-09', sources: { a: tally(0), b: tally(0), c: tally(2) } },
    { date: '2026-10-01', sources: {} },
  ];
  assert.deepEqual(addedOn(runs), { c: '2026-10-08' }, 'those of the first run were there from the start');
  assert.deepEqual(postsByDay(runs, ['2026-10-07', '2026-10-08', '2026-10-09']), { a: [0, 2, 0], b: [0, 3, 0], c: [0, 1, 2] });
});
