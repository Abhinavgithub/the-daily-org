// Who read the paper. The daily job saves one line a day to
// data/readership.jsonl; these functions add the days up for the Stats page.
// Pure: the page reads the file, this makes sense of it.

import type { Count } from './stats';

/** One day's readership as saved, counted by the analytics service. Days are UTC. */
export interface ReadershipDay {
  date: string;
  /** Pages opened. */
  views: number;
  /** Arrivals: a view that came from outside the paper, or from nowhere, not from another of its pages. */
  visits: number;
  /** Views by two-letter country code. */
  countries: Record<string, number>;
  /** Views by the page's path. */
  pages: Record<string, number>;
  /** Visits by the site they came from; "" is none. */
  referrers: Record<string, number>;
  /** Views by kind of device. */
  devices: Record<string, number>;
}

const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
const counts = (value: unknown): Record<string, number> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, n]) => [key, count(n)] as const).filter(([, n]) => n > 0))
    : {};

/** The lines of `data/readership.jsonl`, oldest first. A line that is not a day is skipped; a day saved twice keeps its last line. */
export function parseReadership(text: string): ReadershipDay[] {
  const days = new Map<string, ReadershipDay>();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }
    if (!raw || typeof raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) continue;
    days.set(raw.date, {
      date: raw.date,
      views: count(raw.views),
      visits: count(raw.visits),
      countries: counts(raw.countries),
      pages: counts(raw.pages),
      referrers: counts(raw.referrers),
      devices: counts(raw.devices),
    });
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

const ranked = (totals: Map<string, number>): Count[] =>
  [...totals.entries()].map(([label, n]) => ({ label, count: n })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

/** The first `keep` rows, with everything after them added together as "Others". */
export function topWithOthers(rows: Count[], keep: number): Count[] {
  if (rows.length <= keep + 1) return rows;
  const rest = rows.slice(keep).reduce((sum, row) => sum + row.count, 0);
  return [...rows.slice(0, keep), { label: 'Others', count: rest }];
}

const regions = new Intl.DisplayNames(['en'], { type: 'region' });

/** "IN" as "India". A code that is not a country is shown as it came. */
export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code || 'Unknown';
  try {
    return regions.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * A page's path as a reader would name it, or null for an address that is not
 * one of the paper's reading pages (its own records, files, the counting
 * script). `sections` gives the label of a section id.
 */
export function pageName(path: string, sections: (id: string) => string = (id) => id): string | null {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  if (parts.length === 0) return 'Front page';
  const [first, second] = parts;
  if (/^\d{4}-\d{2}-\d{2}$/.test(first) && parts.length === 1) {
    const day = new Date(`${first}T12:00:00Z`);
    if (Number.isNaN(day.getTime())) return null;
    return `Edition of ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(day)}`;
  }
  if (first === 'section' && second && parts.length === 2) return `Section: ${sections(second)}`;
  if (first === 'tag' && second && parts.length === 2) return `Tag: ${decodeURIComponent(second)}`;
  if (first === 'archive' && parts.length === 1) return 'Archive';
  if (first === 'search' && parts.length === 1) return 'Search';
  return null;
}

/** A referring host as a reader would name it: no "www.", and "Direct" for none. */
export const referrerName = (host: string) => (host ? host.replace(/^www\./, '') : 'Direct');

export interface Readership {
  /** Days in the period that have a record. */
  days: number;
  views: number;
  visits: number;
  /** Views by country name, most first. */
  countries: Count[];
  /** Views by page, most first. Only the paper's reading pages. */
  pages: Count[];
  /** Visits by where they came from, most first. */
  referrers: Count[];
  /** Views by kind of device, most first. */
  devices: Count[];
  /** Each day in order, for the trend. */
  byDay: { date: string; views: number; visits: number }[];
}

/**
 * Days added together. `own` holds the paper's own host names, so that a move
 * from one of its pages to another is not listed as somewhere readers came from.
 */
export function totalReadership(days: ReadershipDay[], options: { sections?: (id: string) => string; own?: string[] } = {}): Readership {
  const own = new Set((options.own ?? []).map((host) => host.replace(/^www\./, '')));
  const add = (totals: Map<string, number>, label: string | null, n: number) => {
    if (label !== null && n > 0) totals.set(label, (totals.get(label) ?? 0) + n);
  };
  const countries = new Map<string, number>();
  const pages = new Map<string, number>();
  const referrers = new Map<string, number>();
  const devices = new Map<string, number>();
  for (const day of days) {
    for (const [code, n] of Object.entries(day.countries)) add(countries, countryName(code), n);
    for (const [path, n] of Object.entries(day.pages)) add(pages, pageName(path, options.sections), n);
    for (const [host, n] of Object.entries(day.referrers)) add(referrers, own.has(host.replace(/^www\./, '')) ? null : referrerName(host), n);
    for (const [kind, n] of Object.entries(day.devices)) add(devices, kind ? kind[0].toUpperCase() + kind.slice(1) : 'Unknown', n);
  }
  return {
    days: days.length,
    views: days.reduce((sum, day) => sum + day.views, 0),
    visits: days.reduce((sum, day) => sum + day.visits, 0),
    countries: ranked(countries),
    pages: ranked(pages),
    referrers: ranked(referrers),
    devices: ranked(devices),
    byDay: days.map(({ date, views, visits }) => ({ date, views, visits })),
  };
}

/**
 * A scale for a chart whose largest figure is `most`: four equal steps in round
 * numbers (1, 2, 2.5 or 5 times a power of ten), the last at or above it.
 */
export function scaleSteps(most: number): number[] {
  const need = Math.max(most, 4) / 4;
  const power = 10 ** Math.floor(Math.log10(need));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= need && Number.isInteger(s * 4)) ?? 10 * power;
  return [0, 1, 2, 3, 4].map((i) => step * i);
}
