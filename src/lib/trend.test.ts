import assert from 'node:assert/strict';
import { test } from 'node:test';
import { axisLabels, group, groupParts, onDays, scale } from './trend';

/** `n` days in a row from `from`, each with figure `count`. */
const run = (from: string, n: number, count = 1) =>
  Array.from({ length: n }, (_, i) => {
    const date = new Date(`${from}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i);
    return { label: date.toISOString().slice(0, 10), count };
  });

test('the two trends share their days, nought where one has none', () => {
  assert.deepEqual(onDays([{ label: '2026-10-04', count: 3 }], ['2026-10-05', '2026-10-04', '2026-10-04']), [
    { label: '2026-10-04', count: 3 },
    { label: '2026-10-05', count: 0 },
  ]);
});

test('a column a day while they fit, then a week, then a month', () => {
  assert.equal(group(run('2026-10-01', 31)).unit, 'day');
  const weeks = group(run('2026-10-03', 40, 2));
  assert.equal(weeks.unit, 'week');
  // Saturday 3 October falls in the week that began on Monday 28 September.
  assert.deepEqual(weeks.buckets[0], { start: '2026-09-28', end: '2026-10-04', editions: 2, total: 4, value: 2 });
  assert.equal(weeks.buckets[1].start, '2026-10-05');
  assert.equal(weeks.buckets[1].editions, 7);
  const months = group(run('2026-01-01', 400));
  assert.equal(months.unit, 'month');
  assert.equal(months.buckets[0].start, '2026-01-01');
  assert.equal(months.buckets.length, 14);
  const latest = group(run('2023-01-01', 1200));
  assert.equal(latest.buckets.length, 31, 'only the latest months, when even months are too many');
  assert.equal(latest.buckets.at(-1)!.start, '2026-04-01');
});

test('one busy day does not set the scale', () => {
  assert.deepEqual(scale([6, 24, 4, 8]), { ticks: [0, 2.5, 5, 7.5, 10], ceiling: 10, cut: true });
  assert.deepEqual(scale([6, 10, 4, 8]), { ticks: [0, 2.5, 5, 7.5, 10], ceiling: 10, cut: false });
  assert.equal(scale([]).cut, false);
});

test('dates under the columns name the month where it starts and always the latest', () => {
  const days = group(run('2026-10-28', 6)).buckets;
  assert.deepEqual(axisLabels(days, 'day', 8), ['28 Oct', '29', '30', '31', '1 Nov', '2']);
  assert.deepEqual(axisLabels(days, 'day', 3), ['', '29 Oct', '', '31', '', '2 Nov']);
  const months = group(run('2025-11-01', 400), 20).buckets;
  assert.deepEqual(axisLabels(months, 'month', 20).slice(0, 3), ['Nov 2025', 'Dec', 'Jan 2026']);
});

test('groupParts groups every series the same way, as an average a day', () => {
  const days = Array.from({ length: 40 }, (_, i) => ({ label: new Date(Date.UTC(2026, 8, 1 + i)).toISOString().slice(0, 10), counts: [2, i % 7 === 6 ? 14 : 0] }));
  const { unit, buckets } = groupParts(days);
  assert.equal(unit, 'week');
  assert.equal(buckets.length, group(days.map((d) => ({ label: d.label, count: 0 }))).buckets.length);
  assert.deepEqual(buckets[1].values, [2, 2]);
  assert.equal(buckets[1].editions, 7);
});

test('groupParts keeps one column a day while they fit', () => {
  const { unit, buckets } = groupParts([{ label: '2026-10-01', counts: [1, 3] }, { label: '2026-10-02', counts: [0, 5] }]);
  assert.equal(unit, 'day');
  assert.deepEqual(buckets.map((b) => b.values), [[1, 3], [0, 5]]);
});
