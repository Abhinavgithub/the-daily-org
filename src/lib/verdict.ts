// A reader's verdict on a story: "Useful? Yes No" at its foot (PLAN.md, step 8).
// The rules both places that take a vote go by: the Worker on Cloudflare
// (worker/index.ts) and the dev server on this machine (pipeline/verdict-dev.ts).
// Pure, apart from hashing, which both runtimes do the same way.

export const VOTES = ['yes', 'no'] as const;
export type Vote = (typeof VOTES)[number];

/** Why a reader said No. Each is optional, and one at most. */
export const REASONS = ['Not about Salesforce', 'Old news', 'Not for my role', 'Not worth the read'] as const;
export type Reason = (typeof REASONS)[number];

/** The part of a story a report says is wrong. */
export const PARTS = ['Headline', 'Summary', 'Diagram', 'Link or source', 'Something else'] as const;
export type Part = (typeof PARTS)[number];

/** Where the page sends a vote, and a report. */
export const VERDICT_PATH = '/api/feedback';
export const REPORT_PATH = '/api/report';

/** The most reports one reader can send in a day. */
export const MAX_REPORTS_A_DAY = 3;

/** The longest note a report can carry. */
export const NOTE_LENGTH = 500;
/** The longest correction printed under a story (pipeline/correct.ts). */
export const CORRECTION_LENGTH = 400;

/** The most stories one reader can vote on in a day. Far above what a person reads; a program finds it soon. */
export const MAX_VOTES_A_DAY = 20;

/** A vote as kept: one a story, a reader and a day. A reader is a hash that changes daily, so two days cannot be joined up. */
export interface VoteRow {
  story: string;
  day: string;
  who: string;
  vote: Vote;
  /** Why not, when the reader said No and chose to say. */
  reason?: Reason;
  at: string;
}

/** What the page sends. `vote: null` takes a vote back. */
export interface VoteRequest {
  story: string;
  vote: Vote | null;
  reason?: Reason;
}

// A story's id is its file under src/content/stories: the edition's day, then its name.
const STORY_ID = /^\d{4}-\d{2}-\d{2}\/[a-z0-9][a-z0-9-]{0,150}$/;

/** Reads a request's body, or says what is wrong with it. A field the paper does not ask for, such as the hidden one only programs fill, is refused. */
export function parseVote(body: unknown): VoteRequest | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Send a story and a vote.' };
  const sent = body as Record<string, unknown>;
  if (Object.keys(sent).some((key) => !['story', 'vote', 'reason'].includes(key))) return { error: 'Only a story, a vote and a reason are taken.' };
  if (!isStoryId(sent.story)) return { error: 'That is not a story of this paper.' };
  if (sent.vote !== null && !VOTES.includes(sent.vote as Vote)) return { error: 'A vote is yes, no or null.' };
  if (sent.reason === undefined) return { story: sent.story, vote: sent.vote as Vote | null };
  if (sent.vote !== 'no' || !REASONS.includes(sent.reason as Reason)) return { error: 'A reason goes with No, and is one of those offered.' };
  return { story: sent.story, vote: 'no', reason: sent.reason as Reason };
}

const isStoryId = (value: unknown): value is string => typeof value === 'string' && STORY_ID.test(value);

/** The day a vote counts on, in UTC. */
export function voteDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Who voted, as a hash of their address, a secret salt and the day. The address itself is never kept, and as
 * the day is part of the hash the same reader on two days cannot be told to be the same.
 */
export async function readerHash(address: string, salt: string, day: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}\n${day}\n${address}`));
  return [...new Uint8Array(bytes).slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface VoteResult {
  status: number;
  rows: VoteRow[];
  error?: string;
}

/**
 * What a request does to the votes: records the reader's vote on a story for the day, changes it if they
 * change their mind, or takes it back. Refused once the reader has voted on MAX_VOTES_A_DAY other stories that day.
 */
export function applyVote(rows: VoteRow[], request: VoteRequest, who: string, now: Date): VoteResult {
  const day = voteDay(now);
  const same = (row: VoteRow) => row.story === request.story && row.day === day && row.who === who;
  const others = rows.filter((row) => !same(row));
  if (request.vote === null) return { status: 200, rows: others };
  const today = others.filter((row) => row.who === who && row.day === day).length;
  if (today >= MAX_VOTES_A_DAY) return { status: 429, rows, error: 'That is enough votes for one day. Thank you.' };
  const row: VoteRow = { story: request.story, day, who, vote: request.vote, at: now.toISOString() };
  if (request.reason) row.reason = request.reason;
  return { status: 200, rows: [...others, row] };
}

// Reports ---------------------------------------------------------------

/** A report as kept. Its id is made where it is kept, so reports from two places never collide. */
export interface ReportRow {
  id: string;
  story: string;
  part: Part;
  note: string;
  day: string;
  who: string;
  at: string;
}

/** What the page sends: a story, the part that is wrong, a note, and Turnstile's token when the paper asks for one. */
export interface ReportRequest {
  story: string;
  part: Part;
  note: string;
  token?: string;
  /** The hidden field was filled, so a program sent it. It is answered as if taken, and dropped. */
  trap: boolean;
}

/**
 * A reader's note as it is kept: links taken out (a note is to say what is wrong, and a link is what spam is for),
 * control characters removed, space tidied, and no longer than NOTE_LENGTH.
 */
export function cleanNote(text: string): string {
  return text
    // eslint-disable-next-line no-control-regex -- control characters are exactly what is being removed
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, '[link]')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, NOTE_LENGTH);
}

export function parseReport(body: unknown): ReportRequest | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Send a story and the part that is wrong.' };
  const sent = body as Record<string, unknown>;
  if (Object.keys(sent).some((key) => !['story', 'part', 'note', 'token', 'website'].includes(key))) return { error: 'Only a story, a part and a note are taken.' };
  if (!isStoryId(sent.story)) return { error: 'That is not a story of this paper.' };
  if (!PARTS.includes(sent.part as Part)) return { error: 'Say which part of the story is wrong.' };
  if (sent.note !== undefined && typeof sent.note !== 'string') return { error: 'A note is text.' };
  if (sent.token !== undefined && typeof sent.token !== 'string') return { error: 'The check was not understood.' };
  const report: ReportRequest = { story: sent.story, part: sent.part as Part, note: cleanNote(sent.note ?? ''), trap: typeof sent.website === 'string' && sent.website !== '' };
  if (sent.token) report.token = sent.token.slice(0, 4096);
  return report;
}

/** Whether a reader may send another report today, given the ones they sent today. */
export function reportAllowed(today: ReportRow[]): { status: number; error?: string } {
  return today.length >= MAX_REPORTS_A_DAY ? { status: 429, error: 'That is enough reports for one day. Thank you.' } : { status: 200 };
}

// For the editor ------------------------------------------------------------

/** What readers said about one story. */
export interface StoryVerdict {
  story: string;
  yes: number;
  no: number;
  reasons: Partial<Record<Reason, number>>;
  reports: number;
}

/** Votes and reports added up by story, the most voted on first. */
export function tally(votes: VoteRow[], reports: ReportRow[]): StoryVerdict[] {
  const by = new Map<string, StoryVerdict>();
  const of = (story: string) => by.get(story) ?? by.set(story, { story, yes: 0, no: 0, reasons: {}, reports: 0 }).get(story)!;
  for (const vote of votes) {
    const row = of(vote.story);
    row[vote.vote]++;
    if (vote.reason) row.reasons[vote.reason] = (row.reasons[vote.reason] ?? 0) + 1;
  }
  for (const report of reports) of(report.story).reports++;
  return [...by.values()].sort((a, b) => b.yes + b.no - (a.yes + a.no) || b.reports - a.reports || a.story.localeCompare(b.story));
}

/** Readers found a story wanting: at least three said No, and more said No than Yes. The editor still decides. */
export function wanting(verdict: StoryVerdict): boolean {
  return verdict.no >= 3 && verdict.no > verdict.yes;
}

/** "Not about Salesforce ×3, Old news" */
export function reasonLine(reasons: StoryVerdict['reasons']): string {
  return Object.entries(reasons)
    .sort((a, b) => b[1]! - a[1]!)
    .map(([reason, n]) => (n! > 1 ? `${reason} ×${n}` : reason))
    .join(', ');
}

/** The lines of data/reader-feedback.jsonl: each a vote or a report, marked by `kind`. A line without a kind is a vote. */
export function splitFeedback(records: Record<string, unknown>[]): { votes: VoteRow[]; reports: ReportRow[] } {
  const votes: VoteRow[] = [];
  const reports: ReportRow[] = [];
  for (const { kind, ...rest } of records) {
    if (kind === 'report') reports.push(rest as unknown as ReportRow);
    else votes.push(rest as unknown as VoteRow);
  }
  return { votes, reports };
}

/** The id of the "Useful?" label for a story, unique on a page that shows the story once. */
export function verdictId(story: string): string {
  return `useful-${story.replace(/[^a-z0-9]+/g, '-')}`;
}
