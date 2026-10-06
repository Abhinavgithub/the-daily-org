import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compact, formatCost, formatNumber, inMonth, outcomes, parseRuns, share, tally, tokensByDay, totalRuns } from './stats';

const lines = [
  // An early run: no tokens at all.
  '{"date":"2026-09-30","fetched":13,"prefiltered":2,"assessed":0,"published":0,"llmCalls":0,"failedFeeds":["yt-a"]}',
  // One model: its total is that model's.
  '{"date":"2026-10-03","assessed":12,"published":3,"models":["m1"],"inputTokens":34159,"outputTokens":15037}',
  'not json',
  '{"date":"someday","assessed":99}',
  '',
  // Two models and one total: it cannot be divided.
  '{"date":"2026-10-03","assessed":14,"published":7,"models":["m2","m1"],"inputTokens":39612,"outputTokens":50914}',
  // Recorded by model.
  '{"date":"2026-10-05","assessed":5,"models":["m1","m2"],"inputTokens":900,"outputTokens":300,"tokensByModel":{"m2":{"input":700,"output":200},"m1":{"input":200,"output":100}}}',
].join('\n');

test('run lines are read leniently', () => {
  const runs = parseRuns(lines);
  assert.equal(runs.length, 4, 'a broken line and a line without a real date are skipped');
  assert.deepEqual(runs[0], { date: '2026-09-30', ranAt: '2026-09-30T12:00:00Z', assessed: 0, published: 0, belowThreshold: 0, briefs: 0, notRelevant: 0, invalid: 0, tokens: [], sources: {} });
  assert.deepEqual(runs[1].tokens, [{ model: 'm1', input: 34159, output: 15037 }]);
  assert.deepEqual(runs[2].tokens, [{ model: 'm1 and m2, combined', input: 39612, output: 50914, combined: true }], 'not guessed between two models');
  assert.deepEqual(runs[3].tokens, [{ model: 'm2', input: 700, output: 200 }, { model: 'm1', input: 200, output: 100 }]);
  assert.deepEqual(parseRuns(''), []);
});

test('tokens add up by model, heaviest first, with a combined row last', () => {
  const all = totalRuns(parseRuns(lines));
  assert.equal(all.assessed, 31);
  assert.deepEqual(all.tokens, [
    { model: 'm1', input: 34359, output: 15137 },
    { model: 'm2', input: 700, output: 200 },
    { model: 'm1 and m2, combined', input: 39612, output: 50914, combined: true },
  ]);
  assert.deepEqual([all.inputTokens, all.outputTokens], [74671, 66251]);

  const october = totalRuns(parseRuns(lines).filter((run) => inMonth(run.date, '2026-10')));
  assert.equal(october.assessed, 31);
  assert.deepEqual(totalRuns([]), { assessed: 0, published: 0, belowThreshold: 0, briefs: 0, notRelevant: 0, invalid: 0, inputTokens: 0, outputTokens: 0, tokens: [] });
});

test('counts are sorted most frequent first, then by name', () => {
  assert.deepEqual(tally(['b', 'a', 'c', 'b', 'a', 'b']), [{ label: 'b', count: 3 }, { label: 'a', count: 2 }, { label: 'c', count: 1 }]);
  assert.deepEqual(tally(['z', 'y']), [{ label: 'y', count: 1 }, { label: 'z', count: 1 }]);
  assert.equal(formatNumber(1049638), '1,049,638');
});

test('what became of the articles reviewed always adds up to them', () => {
  const recorded = totalRuns(parseRuns('{"date":"2026-10-04","assessed":29,"published":21,"notRelevant":4,"belowThreshold":3,"invalidReplies":1,"tokensByModel":{"m1":{"input":10,"output":20}},"costUsd":0.0747}'));
  assert.deepEqual(
    outcomes(recorded).map((part) => [part.label, part.count]),
    [['Published', 21], ['Below the score bar', 3], ['Not relevant', 4], ['Unusable reply', 1]],
  );
  assert.equal(recorded.cost, 0.0747);

  // Close calls printed in brief are their own part, taken out of those that fell short.
  const withBriefs = totalRuns(parseRuns('{"date":"2026-10-06","assessed":10,"published":4,"notRelevant":1,"belowThreshold":5,"briefs":2}\n{"date":"2026-10-06","assessed":3,"published":0,"belowThreshold":3,"briefs":9}'));
  assert.deepEqual(
    outcomes(withBriefs).map((part) => [part.label, part.count]),
    [['Published', 4], ['Printed in brief', 5], ['Below the score bar', 3], ['Not relevant', 1]],
    'a run cannot have printed more briefs than fell below the threshold',
  );
  assert.equal(outcomes(withBriefs).reduce((sum, part) => sum + part.count, 0), withBriefs.assessed);

  // An older run says how many it reviewed and published, and no more.
  const older = totalRuns(parseRuns('{"date":"2026-10-03","assessed":12,"published":3,"models":["m1"],"inputTokens":5,"outputTokens":5}'));
  assert.deepEqual(outcomes(older).map((part) => [part.label, part.count]), [['Published', 3], ['Not recorded', 9]]);
  assert.equal(older.cost, undefined);
  assert.deepEqual(outcomes(totalRuns([])), []);

  // A cost is given only when every run that spent tokens recorded one.
  const mixed = totalRuns(parseRuns('{"date":"2026-10-04","assessed":1,"tokensByModel":{"m1":{"input":1,"output":1}},"costUsd":0.01}\n{"date":"2026-10-04","assessed":1,"tokensByModel":{"m1":{"input":1,"output":1}}}\n{"date":"2026-10-04","assessed":0}'));
  assert.equal(mixed.cost, undefined);
});

test('shares, short numbers, costs and tokens by day', () => {
  assert.equal(share(21, 29), 72);
  assert.equal(share(1, 0), 0);
  assert.equal(compact(284362), '284.4K');
  assert.equal(compact(950), '950');
  assert.equal(formatCost(0.0747), '$0.07');
  assert.equal(formatCost(0.0032), '$0.003');
  assert.deepEqual(tokensByDay(parseRuns(lines)), [
    { label: '2026-10-03', count: 34159 + 15037 + 39612 + 50914 },
    { label: '2026-10-05', count: 1200 },
  ]);
});

test('a run on a free model cost nought, which is not the same as a cost not being known', () => {
  const free = '{"date":"2026-10-04","ranAt":"2026-10-04T03:00:00Z","assessed":1,"tokensByModel":{"m1":{"input":1,"output":1}},"costUsd":0}';
  const paid = '{"date":"2026-10-04","ranAt":"2026-10-04T05:00:00Z","assessed":1,"tokensByModel":{"m2":{"input":1,"output":1}},"costUsd":0.02}';
  const [run] = parseRuns(free);
  assert.deepEqual([run.cost, run.ranAt], [0, '2026-10-04T03:00:00Z']);
  assert.equal(totalRuns(parseRuns(`${free}\n${paid}`)).cost, 0.02);
  // A run that was told nothing still leaves the total unknown.
  assert.equal(totalRuns(parseRuns(`${paid}\n{"date":"2026-10-04","assessed":1,"tokensByModel":{"m1":{"input":1,"output":1}}}`)).cost, undefined);
});
