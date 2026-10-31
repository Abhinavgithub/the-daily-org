// The Archive's calendar: a month of days to a sheet, the weeks starting on a
// Monday. Only months with an edition in them are made, so a month joins the
// calendar with its first edition and nothing has to be set by hand.

/** A day in a month's grid: its date, and the edition printed on it, if any. */
export interface CalendarDay<E> {
  day: string;
  date: number;
  edition?: E;
}

export interface CalendarMonth<E> {
  /** `YYYY-MM`. */
  key: string;
  /** "October 2026". */
  name: string;
  /** Rows of seven, Monday first; `null` where a week runs into the month before or after. */
  weeks: (CalendarDay<E> | null)[][];
  /** The editions of the month, in the order they were given. */
  editions: E[];
}

/** The days of the week, Monday first, short and in full. */
export const WEEKDAYS = [
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday'],
  ['Sun', 'Sunday'],
] as const;

const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * The months that have editions, newest first, each laid out as weeks. An
 * edition is anything with a `day` (`YYYY-MM-DD`); days without one are left
 * in the grid but carry no edition.
 */
export function calendarMonths<E extends { day: string }>(editions: E[]): CalendarMonth<E>[] {
  const byDay = new Map(editions.map((edition) => [edition.day, edition]));
  const keys = [...new Set(editions.map((edition) => edition.day.slice(0, 7)))].sort().reverse();
  return keys.map((key) => {
    const [year, month] = key.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
    // Monday is 0, so the blanks before the first are its place in the week.
    const lead = (first.getUTCDay() + 6) % 7;
    const cells: (CalendarDay<E> | null)[] = Array.from({ length: lead }, () => null);
    for (let date = 1; date <= length; date++) {
      const day = `${key}-${String(date).padStart(2, '0')}`;
      const edition = byDay.get(day);
      cells.push(edition ? { day, date, edition } : { day, date });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
    return { key, name: monthName.format(first), weeks, editions: editions.filter((edition) => edition.day.startsWith(key)) };
  });
}
