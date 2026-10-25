import 'dotenv/config';
import type { CountedReport, CountedVote } from '../src/lib/reader-totals';
import { saveReaderTotals, TOTALS_FILE } from './reader-totals';

// Counts readers' votes and reports on the live site for the Stats page
// (PLAN.md, step 8d), and writes them to data/reader-totals.jsonl. The daily job
// runs it; it asks Cloudflare's D1 database for counts only, so no reader's note
// passes through the job or its logs.
//
//   npm run reader-totals
//
// Needs READER_TOTALS_API_TOKEN, a Cloudflare API token with D1 Read only, and
// the account id, READER_TOTALS_ACCOUNT_ID (READERSHIP_ACCOUNT_ID is used when it
// is not set). Without them it does nothing. `npm run reader-feedback` writes the
// same file on the editor's machine.

const DATABASE = 'the-daily-org-feedback';
const API = 'https://api.cloudflare.com/client/v4';
const token = process.env.READER_TOTALS_API_TOKEN;
const account = process.env.READER_TOTALS_ACCOUNT_ID || process.env.READERSHIP_ACCOUNT_ID;
if (!token || !account) {
  console.log('Reader totals are not set up (READER_TOTALS_API_TOKEN and an account id), so none were counted.');
  process.exit(0);
}

interface Reply<T> {
  success?: boolean;
  result?: T;
  errors?: { message?: string }[];
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}/accounts/${account}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  const body = (await res.json().catch(() => ({}))) as Reply<T>;
  if (!res.ok || !body.success || body.result === undefined) {
    throw new Error(body.errors?.map((e) => e.message).join('; ') || `Cloudflare answered ${res.status}.`);
  }
  return body.result;
}

async function query<T>(id: string, sql: string): Promise<T[]> {
  try {
    const parts = await call<{ results?: T[] }[]>(`/d1/database/${id}/query`, { method: 'POST', body: JSON.stringify({ sql }) });
    return parts.flatMap((part) => part.results ?? []);
  } catch (error) {
    // Before the first vote the Worker has made no tables.
    if (/no such table/i.test((error as Error).message)) return [];
    throw error;
  }
}

try {
  const found = await call<{ uuid: string; name: string }[]>(`/d1/database?name=${encodeURIComponent(DATABASE)}`);
  const database = found.find((db) => db.name === DATABASE);
  if (!database) {
    console.log(`There is no D1 database "${DATABASE}" yet: it is made when the Worker is first deployed.`);
    process.exit(0);
  }
  const votes = await query<CountedVote>(database.uuid, 'SELECT story, vote, COUNT(*) AS n FROM votes GROUP BY story, vote');
  const reports = await query<CountedReport>(database.uuid, 'SELECT story, COUNT(*) AS n FROM reports GROUP BY story');
  const editions = saveReaderTotals(votes, reports);
  const sum = (rows: { n?: number }[]) => rows.reduce((total, row) => total + (row.n ?? 0), 0);
  console.log(`${sum(votes)} votes and ${sum(reports)} reports on ${editions} ${editions === 1 ? 'edition' : 'editions'}, counted in ${TOTALS_FILE}.`);
} catch (error) {
  console.error(`Reader totals could not be counted: ${(error as Error).message}`);
  process.exit(1);
}
