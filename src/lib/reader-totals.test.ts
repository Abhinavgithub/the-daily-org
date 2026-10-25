import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseReaderTotals, readerTotals, readerTotalsText, sumReaderTotals, type StoryFacts } from './reader-totals';

const stories: StoryFacts = new Map([
  ['2026-10-24/a', { section: 'admin', model: 'model-a' }],
  ['2026-10-24/b', { section: 'dev', model: 'model-b' }],
  ['2026-10-25/c', { section: 'admin' }],
]);

test('votes and reports are counted by edition, section and model, and nothing else is kept', () => {
  const days = readerTotals(
    [
      { story: '2026-10-24/a', vote: 'yes' },
      { story: '2026-10-24/a', vote: 'no', n: 2 },
      { story: '2026-10-24/b', vote: 'yes', n: 3 },
      { story: '2026-10-25/c', vote: 'no' },
      { story: '2026-10-25/gone', vote: 'yes' },
      { story: '2026-10-24/a', vote: 'maybe' },
    ],
    [{ story: '2026-10-24/b', n: 2 }, { story: '2026-10-25/c' }],
    stories,
  );
  assert.deepEqual(days, [
    { date: '2026-10-24', sections: { admin: { yes: 1, no: 2 }, dev: { yes: 3, no: 0 } }, reports: { 'model-b': 2 } },
    { date: '2026-10-25', sections: { admin: { yes: 0, no: 1 } }, reports: { '': 1 } },
  ]);
  assert.deepEqual(parseReaderTotals(readerTotalsText(days) + 'not json\n{"date":"soon"}\n'), days, 'the file reads back as written');
  assert.equal(readerTotalsText([]), '');
});

test('a period adds up to votes, the share useful by section, and reports by model', () => {
  const days = parseReaderTotals(
    [
      '{"date":"2026-10-24","sections":{"admin":{"yes":1,"no":2},"dev":{"yes":3,"no":0},"bad":{"yes":-4}},"reports":{"model-b":2}}',
      '{"date":"2026-10-25","sections":{"admin":{"yes":0,"no":1}},"reports":{"":1,"model-b":1}}',
    ].join('\n'),
  );
  const sum = sumReaderTotals(days, (id) => id.toUpperCase());
  assert.equal(sum.votes, 7);
  assert.equal(sum.yes, 4);
  assert.equal(sum.reports, 4);
  assert.deepEqual(sum.sections, [
    { label: 'ADMIN', votes: 4, yes: 1 },
    { label: 'DEV', votes: 3, yes: 3 },
  ]);
  assert.deepEqual(sum.models, [
    { label: 'model-b', count: 3 },
    { label: 'Not recorded', count: 1 },
  ]);
  assert.deepEqual(sum.byDay, [
    { label: '2026-10-24', count: 6 },
    { label: '2026-10-25', count: 1 },
  ]);
  assert.deepEqual(sumReaderTotals([]), { votes: 0, yes: 0, reports: 0, sections: [], models: [], byDay: [] });
});
