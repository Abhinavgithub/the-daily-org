import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { PAPER } from '../src/config';
import { addTallies, scorecard } from '../src/lib/sources';
import { formatNumber, parseRuns } from '../src/lib/stats';
import { SOURCES } from './sources';
import { loadState } from './state';

// How each source has done, from what the runs recorded about it, with a
// verdict on each. It reads files only: no feeds are fetched and no model is called.
//
//   npm run sources                 the last 60 days
//   npm run sources -- --days 90

const { values: args } = parseArgs({ options: { days: { type: 'string', default: '60' } } });
const days = Number(args.days);
if (!Number.isFinite(days) || days < 1) {
  console.error(`--days must be a number of at least 1, got "${args.days}".`);
  process.exit(1);
}

const file = path.join(process.cwd(), 'data', 'stats.jsonl');
const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const runs = (fs.existsSync(file) ? parseRuns(fs.readFileSync(file, 'utf8')) : []).filter((run) => run.date >= since);
const recorded = runs.filter((run) => Object.keys(run.sources).length > 0);
const rows = scorecard(SOURCES, addTallies(recorded.map((run) => run.sources)), loadState());

const day = (iso?: string) => (iso ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : 'not known');
const table = [
  ['Source', 'Posts', 'Reviewed', 'Published', 'Yield', 'Avg score', 'Tokens/story', 'Last post', 'Verdict'],
  ...rows.map((row) => [
    row.name,
    String(row.tally.new),
    String(row.tally.reviewed),
    String(row.tally.published),
    row.yield === undefined ? '-' : `${row.yield}%`,
    row.averageScore === undefined ? '-' : row.averageScore.toFixed(1),
    row.tokensPerStory === undefined ? '-' : formatNumber(row.tokensPerStory),
    day(row.lastPostAt),
    row.verdict.says,
  ]),
];
const widths = table[0].map((_, column) => Math.max(...table.map((line) => line[column].length)));
// Names and verdicts read from the left; figures line up on the right.
const LEFT = new Set([0, 7, 8]);

console.log(`${PAPER.name}: ${SOURCES.length} sources, over the last ${days} days (${recorded.length} run${recorded.length === 1 ? '' : 's'} recorded).\n`);
for (const line of table) console.log(line.map((cell, column) => (LEFT.has(column) ? cell.padEnd(widths[column]) : cell.padStart(widths[column]))).join('  ').trimEnd());

const look = rows.filter((row) => row.verdict.look);
console.log(
  look.length
    ? `\n${look.length} to look at: ${look.map((row) => row.name).join(', ')}. Nothing is removed for you; edit the sources in paper.config.ts.`
    : '\nNothing needs attention.',
);
if (recorded.length < 5) {
  console.log(`\nOnly ${recorded.length} run${recorded.length === 1 ? ' has' : 's have'} recorded figures per source so far, so yield and scores say little yet. "Last post" is filled in the first time a run fetches each feed.`);
}
console.log('\nTry a new source before adding it: npm run try-source -- <feed address>');
