import 'dotenv/config';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { PAPER } from '../src/config';
import { byNewest, readLog, type RunLogData } from '../src/lib/logs';
import type { Source } from '../src/paper';
import { curate, prefilter } from './curate';
import { extractContent } from './extract';
import { loadFeedback, normalizeUrl } from './feedback';
import { fetchFeeds, type FeedItem } from './fetch';
import { configFromEnv, keepFreeModels, LlmClient } from './llm';
import { buildCases, compare, judgement, mark, sentence, tally, type Case, type Judgement, type Result } from './replay-lib';
import { SOURCES } from './sources';

// Judges again the articles the reader flagged, and some the paper got right,
// under the rules as they stand now. It is how a change to the rules is measured.
// Nothing is published and nothing is marked as seen.
//
//   npm run replay                        every flag and 10 controls of each kind
//   npm run replay -- --prefilter-only    the cheap rules only: no model calls
//   npm run replay -- --compare           also list what changed since the last replay
//   npm run replay -- --runs 2            judge each twice, to find the unstable ones

const { values: args } = parseArgs({
  options: {
    'prefilter-only': { type: 'boolean', default: false },
    compare: { type: 'boolean', default: false },
    runs: { type: 'string', default: '1' },
    controls: { type: 'string', default: '10' },
    model: { type: 'string' },
    'max-calls': { type: 'string', default: '80' },
  },
});
const whole = (name: 'runs' | 'controls' | 'max-calls', least: number) => {
  const value = Number(args[name]);
  if (!Number.isInteger(value) || value < least) {
    console.error(`--${name} takes a whole number of at least ${least}, got "${args[name]}".`);
    process.exit(1);
  }
  return value;
};
const runs = whole('runs', 1);
const controls = whole('controls', 0);
const maxCalls = whole('max-calls', 1);
const prefilterOnly = args['prefilter-only'];
const threshold = Number(process.env.SCORE_THRESHOLD) > 0 ? Number(process.env.SCORE_THRESHOLD) : 6;

const data = path.join(process.cwd(), 'data');
const out = path.join(data, 'replay');
const texts = path.join(out, 'texts');

// 1. What to judge
const logsDir = path.join(data, 'logs');
const logs = (fs.existsSync(logsDir) ? fs.readdirSync(logsDir) : [])
  .filter((file) => file.endsWith('.json'))
  .map((file) => readLog(fs.readFileSync(path.join(logsDir, file), 'utf8')))
  .filter((log): log is RunLogData => log !== null)
  .sort(byNewest);
const feedback = loadFeedback();
const cases = buildCases(feedback, logs.flatMap((log) => log.articles), controls);
if (cases.length === 0) {
  console.log('Nothing to replay: no article is flagged and no run has kept its articles. Flag some on the Logs page under `npm run dev`.');
  process.exit(0);
}
const flags = cases.filter((c) => c.role === 'flag').length;
console.log(`${PAPER.name}: replaying ${flags} flagged and ${cases.length - flags} control articles${prefilterOnly ? ', cheap rules only' : `, threshold ${threshold}`}.`);
if (flags === 0) console.log('No article is flagged yet, so this only shows whether the paper agrees with itself.');

// 2. The text of each, as the pipeline would have read it: kept from an earlier replay, else from the feed, else from the page.
interface Kept {
  item: Omit<FeedItem, 'published' | 'source'> & { published: string; source: string };
  text: string;
}
const UNKNOWN: Source = { id: 'unknown', name: 'Unknown', url: '', type: 'community' };
const sourceOf = (name: string) => SOURCES.find((source) => source.name === name || source.id === name) ?? { ...UNKNOWN, name: name || UNKNOWN.name };
const keptAt = (url: string) => path.join(texts, `${createHash('sha1').update(url).digest('hex').slice(0, 16)}.json`);
const read = new Map<string, { item: FeedItem; text: string }>();
for (const c of cases) {
  if (!fs.existsSync(keptAt(c.url))) continue;
  const kept = JSON.parse(fs.readFileSync(keptAt(c.url), 'utf8')) as Kept;
  read.set(c.url, { item: { ...kept.item, published: new Date(kept.item.published), source: sourceOf(kept.item.source) }, text: kept.text });
}
const toRead = cases.filter((c) => !read.has(c.url));
if (toRead.length) {
  const wanted = [...new Set(toRead.map((c) => sourceOf(c.source)))].filter((source) => source.url);
  console.log(`Reading ${toRead.length} article${toRead.length === 1 ? '' : 's'} from ${wanted.length} feed${wanted.length === 1 ? '' : 's'}; ${read.size} already kept.`);
  const { items } = await fetchFeeds(wanted, new Date(Date.now() - 90 * 86_400_000), { attempts: 2 });
  const inFeed = new Map<string, FeedItem>();
  for (const item of items) {
    try {
      inFeed.set(normalizeUrl(item.url), item);
    } catch {
      // An item with no usable address cannot be matched.
    }
  }
  fs.mkdirSync(texts, { recursive: true });
  for (const c of toRead) {
    const item = inFeed.get(c.url) ?? { source: sourceOf(c.source), title: c.title, url: c.url, published: new Date(), authors: [], feedText: '' };
    const { text, pageFailed } = await extractContent(item);
    // Kept only when it is what the pipeline would have read; a failed page may be readable next time.
    if (pageFailed || !text) continue;
    read.set(c.url, { item, text });
    const kept: Kept = { item: { ...item, published: item.published.toISOString(), source: item.source.id }, text };
    fs.writeFileSync(keptAt(c.url), JSON.stringify(kept));
  }
}

// 3. Judge
let llm: LlmClient | undefined;
if (!prefilterOnly) {
  const config = configFromEnv({ model: args.model });
  if (!config.apiKey) {
    console.error('LLM_API_KEY is not set, so the articles cannot be reviewed. Use --prefilter-only to check the cheap rules alone.');
    process.exit(1);
  }
  const { models, notes } = await keepFreeModels(config, process.env.LLM_ALLOW_PAID === '1');
  for (const note of notes) console.warn(`  ${note}`);
  if (models.length === 0) {
    console.error('No usable model left. Run `npm run models`.');
    process.exit(1);
  }
  llm = new LlmClient({ ...config, models });
  console.log(`Judging with ${models.join(', then ')}${runs > 1 ? `, ${runs} times each` : ''}. Cap: ${maxCalls} calls${config.maxCostUsd ? `, $${config.maxCostUsd}` : ''}.`);
}

const SIGN: Record<Result['mark'], string> = { right: 'right   ', wrong: 'WRONG   ', unstable: 'unstable', open: 'open    ', unread: 'unread  ' };
const results: Result[] = [];
let stopped = '';
async function judge(c: Case): Promise<Judgement[]> {
  const known = read.get(c.url);
  if (!known) return [{ got: 'unread', why: 'could not be read' }];
  const dropped = prefilter(known.item, known.text);
  if (dropped || !llm) return [judgement(dropped, undefined, threshold)];
  const judgements: Judgement[] = [];
  for (let run = 0; run < runs; run++) {
    stopped ||= llm.limitReached(maxCalls) ?? '';
    if (stopped) break;
    try {
      const { verdict } = await curate(llm, known.item, known.text);
      judgements.push(judgement(null, verdict, threshold));
    } catch (error) {
      judgements.push({ got: 'failed', why: `could not be reviewed: ${(error as Error).message.replace(/\s+/g, ' ').slice(0, 80)}` });
    }
  }
  return judgements;
}
for (const role of ['flag', 'control'] as const) {
  const mine = cases.filter((c) => c.role === role);
  if (mine.length) console.log(`\n${role === 'flag' ? 'Flagged' : 'Controls'}`);
  for (const c of mine) {
    const judgements = await judge(c);
    // An article the run stopped before reaching is left out, not counted as unread.
    if (judgements.length === 0) continue;
    const result: Result = { ...c, mark: mark(c.expect, judgements.map((j) => j.got)), judgements };
    results.push(result);
    const whys = [...new Set(judgements.map((j) => j.why))].join(' / ');
    console.log(`  ${SIGN[result.mark]}  should ${c.expect.padEnd(7)}  ${whys.padEnd(30)}  ${c.title.slice(0, 70)}${c.note ? `  (${c.note})` : ''}`);
  }
}
if (stopped) console.log(`\nStopped early: ${stopped}. ${cases.length - results.length} not judged.`);

// 4. Report, and keep the result for the next comparison
const earlier = fs.existsSync(out) ? fs.readdirSync(out).filter((file) => file.endsWith('.json')).sort() : [];
console.log(`\n${sentence('Flags', tally(results, 'flag'))} ${sentence('Controls', tally(results, 'control'))}${llm ? ` ${llm.calls} model calls${llm.costReported ? `, $${llm.cost.toFixed(4)}` : ''}.` : ''}`);
if (args.compare) {
  const last = earlier
    .map((file) => JSON.parse(fs.readFileSync(path.join(out, file), 'utf8')) as { ranAt: string; prefilterOnly: boolean; results: Result[] })
    .filter((saved) => saved.prefilterOnly === prefilterOnly)
    .at(-1);
  if (!last) console.log('\nNo earlier replay of this kind to compare with.');
  else {
    const flips = compare(last.results, results);
    console.log(`\nSince the replay of ${last.ranAt.slice(0, 16).replace('T', ' ')}: ${flips.length ? `${flips.length} changed.` : 'nothing changed.'}`);
    for (const flip of flips) console.log(`  ${flip.better === true ? 'better' : flip.better === false ? 'WORSE ' : 'moved '}  ${flip.role.padEnd(7)}  ${flip.from} -> ${flip.to}  ${flip.title.slice(0, 70)}`);
  }
}
fs.mkdirSync(out, { recursive: true });
const ranAt = new Date().toISOString();
fs.writeFileSync(path.join(out, `${ranAt.replace(/[:.]/g, '-')}.json`), JSON.stringify({ ranAt, prefilterOnly, threshold, runs, models: llm ? Object.keys(llm.usage) : [], cost: llm?.cost ?? 0, results }, null, 2));
