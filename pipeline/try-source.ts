import 'dotenv/config';
import { parseArgs } from 'node:util';
import { PAPER } from '../src/config';
import { youtube, type Source } from '../src/paper';
import { curate, prefilter } from './curate';
import { extractContent } from './extract';
import { fetchFeeds } from './fetch';
import { configFromEnv, keepFreeModels, LlmClient, LlmError } from './llm';

// What a source would add to the paper, before it is added. It reads the feed
// as the pipeline would and can have the model review its latest articles.
// Nothing is written and nothing is marked as seen.
//
//   npm run try-source -- https://example.com/feed/
//   npm run try-source -- https://example.com/feed/ --review 3    also review the 3 latest (a few model calls)
//   npm run try-source -- --youtube UCxxxxxxxxxxxxxxxxxxxxxx

const { values: args, positionals } = parseArgs({
  options: { review: { type: 'string' }, youtube: { type: 'string' } },
  allowPositionals: true,
});
const address = positionals[0];
if (!address && !args.youtube) {
  console.error('Give a feed address, or --youtube <channel ID>.\n  npm run try-source -- https://example.com/feed/ --review 3');
  process.exit(1);
}
const review = args.review === undefined ? 0 : Number(args.review);
if (!Number.isInteger(review) || review < 0 || review > 10) {
  console.error(`--review takes a whole number from 0 to 10, got "${args.review}".`);
  process.exit(1);
}

if (address && !URL.canParse(address)) {
  console.error(`"${address}" is not a web address. Give the feed's full address, starting with https://.`);
  process.exit(1);
}
const host = address ? new URL(address).hostname.replace(/^www\./, '') : `youtube-${args.youtube}`;
const id = host.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
const source: Source = args.youtube ? { id, name: host, type: 'video', ...youtube(args.youtube) } : { id, name: host, url: address, type: 'community' };

const DAY = 24 * 60 * 60 * 1000;
const { items, failures, newest } = await fetchFeeds([source], new Date(Date.now() - 90 * DAY), { attempts: 2 });
if (failures.length) {
  console.log(`Could not read it: ${failures[0].error}`);
  console.log('Check that the address is the feed itself and opens in a browser. Some sites refuse automated readers. Not worth adding as it stands.');
  process.exit(1);
}

const latest = newest[source.id];
const within = (days: number) => items.filter((item) => item.published.getTime() >= Date.now() - days * DAY).length;
console.log(`${host}: the feed answered.`);
console.log(`  Newest post: ${latest ? latest.toISOString().slice(0, 10) : 'none'}. ${within(30)} in the last 30 days, ${items.length} in the last 90.`);
if (items.length === 0) {
  console.log('\nNothing recent to judge it by. It would cost nothing to add, and would add nothing until it posts again.');
  process.exit(0);
}

// The cheap filter, on up to ten of the latest.
const sample = items.slice(0, 10);
const kept: { item: (typeof items)[number]; text: string }[] = [];
const lost: Record<string, number> = {};
for (const item of sample) {
  const { text, pageFailed } = await extractContent(item);
  const reason = prefilter(item, text);
  if (!reason) kept.push({ item, text });
  else {
    const why = pageFailed && reason === 'too short' ? 'page could not be read' : reason;
    lost[why] = (lost[why] ?? 0) + 1;
  }
}
console.log(`  Of the ${sample.length} latest, ${kept.length} would reach review${Object.keys(lost).length ? `; lost: ${Object.entries(lost).map(([why, n]) => `${n} ${why}`).join(', ')}` : ''}.`);
if (kept.length === 0) {
  console.log('\nNone of its articles can be read as the pipeline reads them, so nothing from it would ever be reviewed. Not worth adding.');
  process.exit(0);
}

const line = args.youtube
  ? `{ id: '${id}', name: '${host}', ...youtube('${args.youtube}'), type: 'video' },`
  : `{ id: '${id}', name: '${host}', url: '${address}', type: 'community' },`;

if (review === 0) {
  console.log(`\nTo see how the editor would score it, add --review 3 (a few model calls).\nTo add it, put this in the sources of paper.config.ts and give it a proper name:\n  ${line}`);
  process.exit(0);
}

const config = configFromEnv();
if (!config.apiKey) {
  console.error('\nLLM_API_KEY is not set, so the articles cannot be reviewed.');
  process.exit(1);
}
const { models } = await keepFreeModels(config, process.env.LLM_ALLOW_PAID === '1');
if (models.length === 0) {
  console.error('\nNo usable model left. Run `npm run models`.');
  process.exit(1);
}
const llm = new LlmClient({ ...config, models });
const threshold = Number(process.env.SCORE_THRESHOLD) > 0 ? Number(process.env.SCORE_THRESHOLD) : 6;

console.log(`\nReviewing the ${Math.min(review, kept.length)} latest as the editor of ${PAPER.name} would:`);
const scores: number[] = [];
let published = 0;
for (const { item, text } of kept.slice(0, review)) {
  const limit = llm.limitReached();
  if (limit) {
    console.log(`  Stopped: ${limit}.`);
    break;
  }
  try {
    const { verdict } = await curate(llm, item, text);
    const outcome = !verdict.relevant ? 'not relevant' : verdict.interest_score < threshold ? `scored ${verdict.interest_score}, below ${threshold}` : `scored ${verdict.interest_score}, would publish`;
    if (verdict.relevant && verdict.interest_score >= threshold) published++;
    scores.push(verdict.interest_score);
    console.log(`  ${outcome.padEnd(24)} ${verdict.relevant ? verdict.title : item.title}`);
  } catch (err) {
    if (!(err instanceof LlmError) && !(err instanceof Error)) throw err;
    console.log(`  could not be reviewed    ${item.title} (${(err as Error).message.slice(0, 80)})`);
  }
}
if (scores.length) {
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  console.log(`\nWould have published ${published} of ${scores.length}, average score ${average.toFixed(1)}.${llm.cost ? ` This cost $${llm.cost.toFixed(4)}.` : ''}`);
  console.log(published > 0 ? `To add it, put this in the sources of paper.config.ts and give it a proper name:\n  ${line}` : 'On this showing it would add little.');
}
