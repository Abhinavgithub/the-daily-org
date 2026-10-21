import { scaleSteps } from './readership';
import type { Count } from './stats';

// The edition trends on the stats page: a figure for every day with an edition, or for
// every week or month when there are too many days to give each a column.

/** One column of a trend: a day, or a week or month of editions. */
export interface Bucket {
  /** The first day it covers: "2026-10-05". */
  start: string;
  /** The last day in it. */
  end: string;
  /** Days with an edition or a run that it covers. */
  editions: number;
  /** The figures of those editions added together. */
  total: number;
  /** What the column shows: the figure for a day, the average a day for a week or month. */
  value: number;
}

export type Unit = 'day' | 'week' | 'month';

/** The most columns a trend shows, so each stays wide enough to read. */
export const MOST_COLUMNS = 31;

/** Every day in either list, oldest first, each with its figure from `rows`, nought where it has none. */
export function onDays(rows: Count[], days: string[]): Count[] {
  const counts = new Map(rows.map((row) => [row.label, row.count]));
  return [...new Set(days)].sort().map((label) => ({ label, count: counts.get(label) ?? 0 }));
}

/** The Monday of a day's week, or the first of its month. */
function startOf(day: string, unit: Unit): string {
  if (unit === 'day') return day;
  if (unit === 'month') return `${day.slice(0, 7)}-01`;
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

/**
 * Days, oldest first, as columns: one a day while they fit in `most`, then one
 * a week, then one a month. A week or month shows its average a day, so a
 * week only begun is not read as a quiet one.
 */
export function group(days: Count[], most = MOST_COLUMNS): { unit: Unit; buckets: Bucket[] } {
  const units: Unit[] = ['day', 'week', 'month'];
  let result: { unit: Unit; buckets: Bucket[] } = { unit: 'day', buckets: [] };
  for (const unit of units) {
    const buckets = new Map<string, Bucket>();
    for (const day of days) {
      const start = startOf(day.label, unit);
      const bucket = buckets.get(start) ?? { start, end: day.label, editions: 0, total: 0, value: 0 };
      bucket.end = day.label;
      bucket.editions += 1;
      bucket.total += day.count;
      bucket.value = bucket.total / bucket.editions;
      buckets.set(start, bucket);
    }
    result = { unit, buckets: [...buckets.values()] };
    if (result.buckets.length <= most) break;
  }
  return result;
}

/**
 * The scale of a chart: gridlines in round numbers and the top of the chart.
 * When the largest figure is more than twice the next, the scale is set by the
 * next, so one busy day does not flatten the rest; the larger columns are then
 * drawn cut short, with their figures printed.
 */
export function scale(values: number[]): { ticks: number[]; ceiling: number; cut: boolean } {
  const [first = 0, second = 0] = [...values].sort((a, b) => b - a);
  const cut = second > 0 && first > 2 * second;
  const ticks = scaleSteps(cut ? second * 1.15 : first);
  return { ticks, ceiling: ticks[4], cut };
}

const format = (day: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));

/**
 * The date under each column, or '' for none. Some columns are labelled, counted
 * back from the latest so it always is, with no more than `room` labels. The
 * first label and any in a new month name the month; a month column names the
 * year when it is January or the first.
 */
export function axisLabels(buckets: Bucket[], unit: Unit, room = 8): string[] {
  const every = Math.max(1, Math.ceil(buckets.length / room));
  let month = '';
  return buckets.map((bucket, i) => {
    if ((buckets.length - 1 - i) % every !== 0) return '';
    if (unit === 'month') {
      const named = month === '' || bucket.start.endsWith('-01-01');
      month = bucket.start;
      return format(bucket.start, named ? { month: 'short', year: 'numeric' } : { month: 'short' });
    }
    const newMonth = bucket.start.slice(0, 7) !== month;
    month = bucket.start.slice(0, 7);
    return newMonth || unit === 'week' ? format(bucket.start, { day: 'numeric', month: 'short' }) : String(Number(bucket.start.slice(8)));
  });
}
