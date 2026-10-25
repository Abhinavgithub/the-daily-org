import { applyVote, parseReport, parseVote, readerHash, REPORT_PATH, reportAllowed, VERDICT_PATH, voteDay, type ReportRow, type VoteRow } from '../src/lib/verdict';

// The paper on Cloudflare: its static files, and one address that is not a file,
// where readers' "Useful? Yes No" votes and their reports of mistakes are kept in D1 (PLAN.md, steps 8a and 8b).
// wrangler.jsonc sends only /api/* here; every other request is served from dist
// without running this code. `npm run dev` takes votes in the same way (pipeline/verdict-dev.ts).

// The parts of Cloudflare's types this uses, so the project needs no package for them.
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}
interface D1 {
  prepare(sql: string): D1Statement;
}
interface Env {
  ASSETS: { fetch(request: Request | string): Promise<Response> };
  /** The votes database, made by Wrangler on the first deploy (wrangler.jsonc). Without it, votes are refused. */
  FEEDBACK?: D1;
  /** Turnstile's secret key, set with `npx wrangler secret put TURNSTILE_SECRET`. With it, a report must pass the check. */
  TURNSTILE_SECRET?: string;
}

// The tables, made the first time a vote arrives, so a new database needs nothing done by hand.
// A vote is one row a story, a reader and a day. `who` hashes the reader's address with that day's salt;
// a salt is a random value kept only for its own day and then deleted, so after the day no hash can be
// traced back to an address, not even by whoever holds the database.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS votes (
    story TEXT NOT NULL, day TEXT NOT NULL, who TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')), at TEXT NOT NULL,
    PRIMARY KEY (story, day, who))`,
  'CREATE INDEX IF NOT EXISTS votes_by_reader ON votes (who, day)',
  'CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL)',
  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, story TEXT NOT NULL, part TEXT NOT NULL, note TEXT NOT NULL,
    day TEXT NOT NULL, who TEXT NOT NULL, at TEXT NOT NULL)`,
  'CREATE INDEX IF NOT EXISTS reports_by_reader ON reports (who, day)',
];
// Added after the first tables were made. A database that has the column already refuses, which is fine.
const LATER = ['ALTER TABLE votes ADD COLUMN reason TEXT'];
let ready: Promise<unknown> | undefined;
const prepared = (db: D1) =>
  (ready ??= SCHEMA.reduce<Promise<unknown>>((done, sql) => done.then(() => db.prepare(sql).run()), Promise.resolve())
    .then(() => Promise.all(LATER.map((sql) => db.prepare(sql).run().catch(() => undefined))))
    .catch((error) => {
      ready = undefined;
      throw error;
    }));

/** The day's salt: made by the first vote of the day, while the days before are forgotten. */
async function saltFor(db: D1, day: string): Promise<string> {
  const fresh = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
  await db.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, fresh).run();
  await db.prepare('DELETE FROM salts WHERE day < ?').bind(day).run();
  const { results } = await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).all<{ salt: string }>();
  return results[0]?.salt ?? fresh;
}

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// The ids of the stories printed, read once from this deployment's own files and kept while the Worker stays warm.
let printed: Promise<Set<string>> | undefined;
function storyIds(env: Env, url: URL): Promise<Set<string>> {
  printed ??= env.ASSETS.fetch(new URL('/story-ids.json', url).toString())
    .then((response) => (response.ok ? response.json() : []))
    .then((ids) => new Set(Array.isArray(ids) ? ids.map(String) : []))
    .catch(() => {
      printed = undefined;
      return new Set<string>();
    });
  return printed;
}

async function vote(request: Request, env: Env): Promise<Response> {
  const refused = refuse(request, env);
  if (refused) return refused;
  const url = new URL(request.url);

  let body: unknown;
  try {
    body = JSON.parse((await request.text()).slice(0, 2000));
  } catch {
    return json(400, { error: 'The request was not JSON.' });
  }
  const sent = parseVote(body);
  if ('error' in sent) return json(400, sent);
  if (!(await storyIds(env, url)).has(sent.story)) return json(404, { error: 'That is not a story of this paper.' });

  const db = env.FEEDBACK!;
  await prepared(db);
  const now = new Date();
  const day = voteDay(now);
  const who = await readerHash(request.headers.get('CF-Connecting-IP') ?? '', await saltFor(db, day), day);
  // The same rules as on this machine, applied to this reader's votes for the day.
  const { results } = await db.prepare('SELECT story, day, who, vote, reason, at FROM votes WHERE who = ? AND day = ?').bind(who, day).all<VoteRow>();
  const result = applyVote(results, sent, who, now);
  if (result.error) return json(result.status, { error: result.error });
  const row = result.rows.find((r) => r.story === sent.story && r.day === day && r.who === who);
  if (row) {
    await db
      .prepare(
        'INSERT INTO votes (story, day, who, vote, reason, at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (story, day, who) DO UPDATE SET vote = excluded.vote, reason = excluded.reason, at = excluded.at',
      )
      .bind(row.story, row.day, row.who, row.vote, row.reason ?? null, row.at)
      .run();
  } else {
    await db.prepare('DELETE FROM votes WHERE story = ? AND day = ? AND who = ?').bind(sent.story, day, who).run();
  }
  return json(200, { ok: true });
}

/** Asks Turnstile whether the reader passed its check. Without a secret set, there is no check to pass. */
async function passed(env: Env, token: string | undefined, address: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', token);
  if (address) form.append('remoteip', address);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const outcome = (await response.json().catch(() => ({}))) as { success?: boolean };
  return outcome.success === true;
}

async function report(request: Request, env: Env): Promise<Response> {
  const refused = refuse(request, env);
  if (refused) return refused;
  let body: unknown;
  try {
    body = JSON.parse((await request.text()).slice(0, 8000));
  } catch {
    return json(400, { error: 'The request was not JSON.' });
  }
  const sent = parseReport(body);
  if ('error' in sent) return json(400, sent);
  // A program filled the hidden field: answered as if taken, so it learns nothing.
  if (sent.trap) return json(200, { ok: true });
  const url = new URL(request.url);
  if (!(await storyIds(env, url)).has(sent.story)) return json(404, { error: 'That is not a story of this paper.' });
  const address = request.headers.get('CF-Connecting-IP') ?? '';
  if (!(await passed(env, sent.token, address))) return json(403, { error: 'The check that you are a person did not pass. Try again.' });

  const db = env.FEEDBACK!;
  await prepared(db);
  const now = new Date();
  const day = voteDay(now);
  const who = await readerHash(address, await saltFor(db, day), day);
  const { results } = await db.prepare('SELECT id, story, part, note, day, who, at FROM reports WHERE who = ? AND day = ?').bind(who, day).all<ReportRow>();
  const allowed = reportAllowed(results);
  if (allowed.error) return json(allowed.status, { error: allowed.error });
  await db
    .prepare('INSERT INTO reports (id, story, part, note, day, who, at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), sent.story, sent.part, sent.note, day, who, now.toISOString())
    .run();
  return json(200, { ok: true });
}

/** What every request to the paper's addresses must be: a POST of JSON from the paper's own pages, with somewhere to keep it. */
function refuse(request: Request, env: Env): Response | undefined {
  if (request.method !== 'POST') return json(405, { error: 'Only POST is understood.' });
  const url = new URL(request.url);
  // Only the paper's own pages may send. A JSON body cannot be sent from another site without the browser asking first, and an Origin from elsewhere is refused.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) return json(403, { error: 'Only the paper\'s own pages may send this.' });
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json(415, { error: 'Send JSON.' });
  if (!env.FEEDBACK) return json(503, { error: 'Feedback is not switched on yet.' });
  return undefined;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const handler = url.pathname === VERDICT_PATH ? vote : url.pathname === REPORT_PATH ? report : undefined;
    if (handler) {
      try {
        return await handler(request, env);
      } catch {
        return json(500, { error: 'That could not be saved. Try again.' });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
