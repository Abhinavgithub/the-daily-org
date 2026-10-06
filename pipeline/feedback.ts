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

/** Takes back the verdict on an article. */
export function removeFeedback(entries: Feedback[], url: string): Feedback[] {
  const target = normalizeUrl(url);
  return entries.filter((e) => normalizeUrl(e.url) !== target);
}

/**
 * The verdict that can be given on an article, from what the run did with it.
 * A printed one can be junk; a rejected one can have been missed. An article
 * the run never judged (it is tried again) has none.
 */
export function kindFor(outcome: string): FeedbackKind | undefined {
  if (outcome === 'published') return 'junk';
  if (outcome === 'below-threshold' || outcome === 'not-relevant' || outcome === 'dropped') return 'missed';
  return undefined;
}

export interface FeedbackReply {
  status: number;
  entries: Feedback[];
  error?: string;
}

/** What a request from the Logs page does to the log: POST flags an article or saves its note, DELETE takes the flag back. */
export function applyRequest(method: string, body: unknown, entries: Feedback[], now = new Date()): FeedbackReply {
  const refuse = (status: number, error: string): FeedbackReply => ({ status, entries, error });
  if (method !== 'POST' && method !== 'DELETE') return refuse(405, 'Only POST and DELETE are understood.');
  const sent = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  let url: string;
  try {
    url = normalizeUrl(String(sent.url ?? ''));
  } catch {
    return refuse(400, 'That is not an article address.');
  }
  if (method === 'DELETE') return { status: 200, entries: removeFeedback(entries, url) };
  if (!FEEDBACK_KINDS.includes(sent.kind as FeedbackKind)) return refuse(400, `The kind must be one of: ${FEEDBACK_KINDS.join(', ')}.`);
  const entry: Feedback = { at: now.toISOString(), kind: sent.kind as FeedbackKind, url };
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, 500) : undefined);
  if (text(sent.title)) entry.title = text(sent.title);
  if (text(sent.source)) entry.source = text(sent.source);
  if (typeof sent.interest === 'number' && Number.isFinite(sent.interest)) entry.interest = sent.interest;
  if (text(sent.note)) entry.note = text(sent.note);
  return { status: 200, entries: addFeedback(entries, entry) };
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
