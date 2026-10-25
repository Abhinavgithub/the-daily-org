import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { loadReaderFeedback, READER_FILE, saveReaderFeedback } from './verdict-dev';
import type { ReportRow, VoteRow } from '../src/lib/verdict';

// Brings readers' votes and reports from the live site to this machine, for the
// Readers section of the Logs page (`npm run dev`, then /logs/#readers).
//
//   npm run reader-feedback
//   npm run reader-feedback -- --local   from `wrangler dev`'s own database instead, to try it out
//
// Reads the D1 database the Worker keeps (wrangler.jsonc) with Wrangler, which
// must be signed in to the paper's Cloudflare account (`npx wrangler login`).
// What is read replaces data/reader-feedback.jsonl, so votes made under
// `npm run dev` go; which reports were dealt with is kept apart and stays.

const DATABASE = 'the-daily-org-feedback';
const { values: args } = parseArgs({ options: { local: { type: 'boolean', default: false } } });

function query<T>(sql: string): T[] {
  let out: string;
  try {
    out = execFileSync('npx', ['--yes', 'wrangler', 'd1', 'execute', DATABASE, args.local ? '--local' : '--remote', '--json', '--command', sql], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const detail = String((error as { stderr?: string }).stderr ?? (error as Error).message).trim();
    if (/no such table/i.test(detail)) return [];
    console.error(`Wrangler could not read the database "${DATABASE}".\n${detail}\n\nIs Wrangler signed in? Run \`npx wrangler login\` and try again.`);
    process.exit(1);
  }
  const parsed = JSON.parse(out) as { results?: T[] }[];
  return parsed.flatMap((part) => part.results ?? []);
}

const before = loadReaderFeedback();
const votes = query<VoteRow & { reason: VoteRow['reason'] | null }>('SELECT story, day, who, vote, reason, at FROM votes ORDER BY at').map(({ reason, ...vote }) => (reason ? { ...vote, reason } : vote));
const reports = query<ReportRow>('SELECT id, story, part, note, day, who, at FROM reports ORDER BY at');
saveReaderFeedback(votes, reports);

const fresh = reports.filter((report) => !before.reports.some((old) => old.id === report.id)).length;
console.log(`${votes.length} votes and ${reports.length} reports from ${args.local ? 'wrangler dev' : 'the live site'} (${fresh} new) are in ${READER_FILE}.`);
console.log('See them on the Logs page under `npm run dev`: /logs/#readers');
