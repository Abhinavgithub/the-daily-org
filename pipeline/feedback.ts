import fs from 'node:fs';
import path from 'node:path';

// A hand-kept record of what the paper got wrong: a printed story that was junk,
// or an article it skipped that should have run. One JSON object per line in
// data/feedback.jsonl. It is the test data for tuning the scoring rules.

export const FEEDBACK_KINDS = ['junk', 'missed'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export interface Feedback {
  at: string;
  kind: FeedbackKind;
  url: string;
  title?: string;
  source?: string;
  section?: string;
  /** For a printed story: the interest score it was given. */
  interest?: number;
  note?: string;
}

/** The same article under a different spelling of its address counts once. */
export function normalizeUrl(raw: string): string {
  const url = new URL(raw.trim());
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/.test(key)) url.searchParams.delete(key);
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/(.)\/$/, '$1');
  return url.toString().replace(/\/$/, '');
}

export function parseFeedback(text: string): Feedback[] {
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as Feedback);
}

/** Adds an entry, replacing an earlier one for the same article so the latest verdict stands. */
export function addFeedback(entries: Feedback[], entry: Feedback): Feedback[] {
  const url = normalizeUrl(entry.url);
  return [...entries.filter((e) => normalizeUrl(e.url) !== url), { ...entry, url }];
}

export function summarize(entries: Feedback[]): { junk: number; missed: number; bySource: Record<string, { junk: number; missed: number }> } {
  const bySource: Record<string, { junk: number; missed: number }> = {};
  const total = { junk: 0, missed: 0 };
  for (const e of entries) {
    total[e.kind]++;
    const row = (bySource[e.source ?? 'unknown'] ??= { junk: 0, missed: 0 });
    row[e.kind]++;
  }
  return { ...total, bySource };
}

export const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.jsonl');

export function loadFeedback(file = FEEDBACK_FILE): Feedback[] {
  return fs.existsSync(file) ? parseFeedback(fs.readFileSync(file, 'utf8')) : [];
}

export function saveFeedback(entries: Feedback[], file = FEEDBACK_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, entries.map((e) => JSON.stringify(e)).join('\n') + (entries.length ? '\n' : ''));
}
