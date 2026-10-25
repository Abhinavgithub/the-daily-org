// Readers' verdicts as totals, for the Stats page (PLAN.md, step 8d). The votes
// and reports themselves stay private (data/reader-feedback.jsonl is kept out of
// git); what is saved here is only counts, one line for each edition, in
// data/reader-totals.jsonl, which is committed and built into the site. Pure:
// the scripts in pipeline/ write the file, the page reads it.

import { jsonLines } from './jsonl';
import type { Count } from './stats';

/** The verdicts on one edition's stories. */
export interface ReaderTotalsDay {
  /** The edition the stories were printed in, not the day the votes came. */
  date: string;
  /** Yes and No by the stories' section id. */
  sections: Record<string, { yes: number; no: number }>;
  /** Reports of a mistake by the model that wrote the story; "" when it is not known. */
  reports: Record<string, number>;
}

/** What each story is, to file its votes under: its section and the model that wrote it. */
export type StoryFacts = Map<string, { section: string; model?: string }>;

/** Rows as a database counts them, or one row a vote or report with `n` left out. */
export interface CountedVote {
  story: string;
  vote: string;
  n?: number;
}
export interface CountedReport {
  story: string;
  n?: number;
}

const editionOf = (story: string) => story.slice(0, 10);

/**
 * The totals for every edition with a vote or a report, oldest first. A story
 * the paper no longer prints is left out, since it has no section to go under.
 */
export function readerTotals(votes: CountedVote[], reports: CountedReport[], stories: StoryFacts): ReaderTotalsDay[] {
  const days = new Map<string, ReaderTotalsDay>();
  const dayOf = (story: string) => {
    const date = editionOf(story);
    let day = days.get(date);
    if (!day) days.set(date, (day = { date, sections: {}, reports: {} }));
    return day;
  };
  for (const row of votes) {
    const facts = stories.get(row.story);
    if (!facts || (row.vote !== 'yes' && row.vote !== 'no')) continue;
    const section = (dayOf(row.story).sections[facts.section] ??= { yes: 0, no: 0 });
    section[row.vote] += row.n ?? 1;
  }
  for (const row of reports) {
    const facts = stories.get(row.story);
    if (!facts) continue;
    const day = dayOf(row.story);
    const model = facts.model ?? '';
    day.reports[model] = (day.reports[model] ?? 0) + (row.n ?? 1);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** The file's text: one line an edition. */
export const readerTotalsText = (days: ReaderTotalsDay[]) => days.map((day) => JSON.stringify(day)).join('\n') + (days.length ? '\n' : '');

const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** The lines of data/reader-totals.jsonl, oldest first. A line that is not an edition is skipped. */
export function parseReaderTotals(text: string): ReaderTotalsDay[] {
  const days = new Map<string, ReaderTotalsDay>();
  for (const raw of jsonLines(text)) {
    if (typeof raw.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) continue;
    const sections: ReaderTotalsDay['sections'] = {};
    for (const [id, value] of Object.entries(isObject(raw.sections) ? raw.sections : {})) {
      const row = isObject(value) ? { yes: count(value.yes), no: count(value.no) } : { yes: 0, no: 0 };
      if (row.yes + row.no > 0) sections[id] = row;
    }
    const reports: ReaderTotalsDay['reports'] = {};
    for (const [model, n] of Object.entries(isObject(raw.reports) ? raw.reports : {})) if (count(n) > 0) reports[model] = count(n);
    days.set(raw.date, { date: raw.date, sections, reports });
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface ShareRow {
  label: string;
  votes: number;
  /** Of the votes, how many said Yes. */
  yes: number;
}

export interface ReaderSummary {
  votes: number;
  yes: number;
  reports: number;
  /** By section, the most votes first. */
  sections: ShareRow[];
  /** Reports by the model that wrote the story, the most first. */
  models: Count[];
  /** Votes by edition, for a trend. */
  byDay: Count[];
}

/** A period's totals added up. `label` turns a section id into its name. */
export function sumReaderTotals(days: ReaderTotalsDay[], label: (section: string) => string = (id) => id): ReaderSummary {
  const sections = new Map<string, ShareRow>();
  const models = new Map<string, number>();
  const byDay: Count[] = [];
  let votes = 0;
  let yes = 0;
  let reports = 0;
  for (const day of days) {
    let dayVotes = 0;
    for (const [id, row] of Object.entries(day.sections)) {
      const name = label(id);
      const into = sections.get(name) ?? { label: name, votes: 0, yes: 0 };
      into.votes += row.yes + row.no;
      into.yes += row.yes;
      sections.set(name, into);
      dayVotes += row.yes + row.no;
      yes += row.yes;
    }
    votes += dayVotes;
    if (dayVotes > 0) byDay.push({ label: day.date, count: dayVotes });
    for (const [model, n] of Object.entries(day.reports)) {
      const name = model || 'Not recorded';
      models.set(name, (models.get(name) ?? 0) + n);
      reports += n;
    }
  }
  return {
    votes,
    yes,
    reports,
    sections: [...sections.values()].sort((a, b) => b.votes - a.votes || a.label.localeCompare(b.label)),
    models: [...models.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    byDay,
  };
}
