// A reader's verdict on a story: "Useful? Yes No" at its foot (PLAN.md, step 8).
// The rules both places that take a vote go by: the Worker on Cloudflare
// (worker/index.ts) and the dev server on this machine (pipeline/verdict-dev.ts).
// Pure, apart from hashing, which both runtimes do the same way.

export const VOTES = ['yes', 'no'] as const;
export type Vote = (typeof VOTES)[number];

/** Where the page sends a vote. */
export const VERDICT_PATH = '/api/feedback';

/** The most stories one reader can vote on in a day. Far above what a person reads; a program finds it soon. */
export const MAX_VOTES_A_DAY = 20;

/** A vote as kept: one a story, a reader and a day. A reader is a hash that changes daily, so two days cannot be joined up. */
export interface VoteRow {
  story: string;
  day: string;
  who: string;
  vote: Vote;
  at: string;
}

/** What the page sends. `vote: null` takes a vote back. */
export interface VoteRequest {
  story: string;
  vote: Vote | null;
}

// A story's id is its file under src/content/stories: the edition's day, then its name.
const STORY_ID = /^\d{4}-\d{2}-\d{2}\/[a-z0-9][a-z0-9-]{0,150}$/;

/** Reads a request's body, or says what is wrong with it. A field the paper does not ask for, such as the hidden one only programs fill, is refused. */
export function parseVote(body: unknown): VoteRequest | { error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Send a story and a vote.' };
  const sent = body as Record<string, unknown>;
  if (Object.keys(sent).some((key) => key !== 'story' && key !== 'vote')) return { error: 'Only a story and a vote are taken.' };
  if (typeof sent.story !== 'string' || !STORY_ID.test(sent.story)) return { error: 'That is not a story of this paper.' };
  if (sent.vote !== null && !VOTES.includes(sent.vote as Vote)) return { error: 'A vote is yes, no or null.' };
  return { story: sent.story, vote: sent.vote as Vote | null };
}

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
  return { status: 200, rows: [...others, { story: request.story, day, who, vote: request.vote, at: now.toISOString() }] };
}

/** The id of the "Useful?" label for a story, unique on a page that shows the story once. */
export function verdictId(story: string): string {
  return `useful-${story.replace(/[^a-z0-9]+/g, '-')}`;
}
