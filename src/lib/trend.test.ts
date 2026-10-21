import assert from 'node:assert/strict';
import { test } from 'node:test';
import { axisLabels, group, onDays, scale } from './trend';

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
  const months = group(run('2025-11-01', 400), 10).buckets;
  assert.deepEqual(axisLabels(months, 'month', 20).slice(0, 3), ['Nov 2025', 'Dec', 'Jan 2026']);
});
