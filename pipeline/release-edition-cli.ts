import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { PAPER } from '../src/config';
import { BAR, getReleaseEditions } from '../src/lib/release-store';
import { HEADLINES, headlines, printed } from '../src/lib/release-edition';
import type { ReleaseStatus } from '../src/lib/logs';
import { readReleases } from '../src/lib/releases';
import { configFromEnv, keepFreeModels, LlmClient } from './llm';
import { RunLog } from './log';
import { buildEdition, pickHeadlines } from './release-edition';
import { due, waiting, type Due } from './release-due';
import { FRONT_PAGE, helpContext, helpTopic } from './release-notes';
import { RELEASES_PATH } from './releases';

// Builds the release edition, when one is owed: once when a new release's notes
// appear, and once more when the release has reached production. On every other
// day it does nothing, and on most of them it asks nothing. The daily run calls
// it after the day's edition is written; it can be run by hand as well.
//
//   npm run release-edition                      build whatever is owed today
//   npm run release-edition -- --dry-run         say what is owed, and build nothing
//   npm run release-edition -- --release 264     build that release's edition now, owed or not
//   npm run release-edition -- --headlines       choose the newest saved edition's headlines again, without rebuilding it

const { values: args } = parseArgs({ options: { release: { type: 'string' }, 'dry-run': { type: 'boolean' }, headlines: { type: 'boolean' }, model: { type: 'string' } } });
const notes = PAPER.releaseNotes;
if (!notes) {
  console.log('This paper has no release notes to read ("releaseNotes" in paper.config.ts). Nothing to do.');
  process.exit(0);
}
if (args.release !== undefined && !/^\d{3}(\.\d+){0,2}$/.test(args.release)) {
  console.error(`--release takes the release's number, such as 264, got "${args.release}".`);
  process.exit(1);
}

const DIR = path.join(process.cwd(), 'data', 'release-editions');
const STATUS = path.join(process.cwd(), 'data', 'release-edition-status.json');
const STATS = path.join(process.cwd(), 'data', 'stats.jsonl');
const today = new Date().toISOString().slice(0, 10);
/** How this run of the step went, kept for the Logs page. A dry run leaves no record. */
function report(outcome: ReleaseStatus['outcome'], says?: string): void {
  if (args['dry-run']) return;
  fs.mkdirSync(path.dirname(STATUS), { recursive: true });
  fs.writeFileSync(STATUS, JSON.stringify({ at: new Date().toISOString(), outcome, ...(says ? { says } : {}) }, null, 2) + '\n');
}
const editions = getReleaseEditions();
const releases = fs.existsSync(RELEASES_PATH) ? readReleases(JSON.parse(fs.readFileSync(RELEASES_PATH, 'utf8'))) : [];
const total = (edition: Parameters<typeof printed>[0]) => printed(edition, BAR).reduce((sum, area) => sum + area.count, 0);

let owed: Due[];
if (args.headlines) {
  owed = [];
} else if (args.release) {
  owed = [{ number: args.release.includes('.') ? args.release : `${args.release}.0.0`, reason: 'new' }];
} else if (!waiting(editions, releases, today)) {
  console.log('Release edition: nothing is awaited. The notes were not asked.');
  report('nothing-awaited');
  process.exit(0);
} else {
  // One request says which is the newest release with notes, whatever release is asked about.
  let latest: string | undefined;
  let refused: string | undefined;
  try {
    latest = (await helpTopic(FRONT_PAGE, editions[0]?.release.number ?? '', await helpContext())).latest;
  } catch (err) {
    refused = (err as Error).message;
    console.warn(`Release edition: the notes could not be asked (${refused}). It is tried again on the next run.`);
  }
  owed = due(editions, releases, latest, today);
  if (owed.length === 0) {
    console.log(`Release edition: nothing is owed today. The newest release with notes is ${latest ?? 'not known'}.`);
    report(refused ? 'could-not-ask' : 'nothing-owed', refused);
    process.exit(refused ? 1 : 0);
  }
}

const why = { new: 'its notes have appeared', production: 'it has reached production' };
const which = args.release ? editions.find((edition) => edition.release.number.split('.')[0] === args.release!.split('.')[0]) : editions[0];
if (args.headlines) {
  if (!which) {
    console.error('There is no saved edition to choose headlines for.');
    process.exit(1);
  }
  console.log(`Release edition: the headlines of ${which.release.name} are to be chosen again.`);
}
for (const one of owed) console.log(`Release edition: ${one.number} is to be built${args.release ? '' : `, because ${why[one.reason]}`}.`);
if (args['dry-run']) process.exit(0);

const config = configFromEnv({ model: args.model });
if (!config.apiKey) {
  console.error('LLM_API_KEY is not set, so no release edition can be built.');
  report('failed', 'no key for the model is set');
  process.exit(1);
}
const { models, notes: modelNotes } = await keepFreeModels(config, process.env.LLM_ALLOW_PAID === '1');
for (const note of modelNotes) console.warn(`  ${note}`);
if (models.length === 0) {
  console.error('No usable model left, so no release edition can be built.');
  report('failed', 'no usable model is left');
  process.exit(1);
}

/** What a build or a choice of headlines spent goes among the runs, so that it is counted with the rest of the paper's costs. */
function spent(llm: LlmClient, at: string): void {
  if (llm.calls === 0) return;
  fs.appendFileSync(STATS, JSON.stringify({ date: today, ranAt: at, kind: 'release', llmCalls: llm.calls, retries: llm.retries, tokensByModel: llm.usage, ...(llm.costReported ? { costUsd: Number(llm.cost.toFixed(6)) } : {}) }) + '\n');
}

if (args.headlines && which) {
  const llm = new LlmClient({ ...config, models });
  const runLog = new RunLog('release', today);
  const chosen = await pickHeadlines(llm, which.areas, which.release.name, HEADLINES);
  if (chosen.length === 0) runLog.stop('no usable choice of headlines came back');
  // The call is counted among the runs whether or not it gave anything.
  const at = new Date().toISOString();
  spent(llm, at);
  runLog.save({ llm, ...(llm.calls > 0 ? { statsAt: at } : {}) });
  if (chosen.length === 0) {
    console.error('  No usable choice came back. The edition is left as it was.');
    process.exit(1);
  }
  const edition = { ...which, headlines: chosen };
  fs.writeFileSync(path.join(DIR, `${which.release.slug}.json`), JSON.stringify(edition, null, 2) + '\n');
  console.log(`  ${headlines(edition, BAR).map((feature, i) => `${i + 1}. ${feature.name} (${feature.area})`).join('\n  ')}`);
  console.log(`  ${llm.calls} model ${llm.calls === 1 ? 'call' : 'calls'}${llm.costReported ? `, $${llm.cost.toFixed(4)}` : ''}.`);
  process.exit(0);
}

const built: string[] = [];
const failures: string[] = [];
for (const one of owed) {
  // Each build has its own count of what it spent, and its own entry among the runs.
  const llm = new LlmClient({ ...config, models });
  const runLog = new RunLog('release', today);
  try {
    const edition = await buildEdition(llm, one.number, { areas: notes.areas, log: console.log });
    const features = total(edition);
    if (features === 0) {
      console.warn(`  ${edition.release.name}: nothing in its notes cleared the bar yet, so no edition is saved. It is tried again on the next run.`);
      runLog.stop(`nothing in the ${edition.release.name} notes cleared the bar yet`);
    } else {
      fs.mkdirSync(DIR, { recursive: true });
      fs.writeFileSync(path.join(DIR, `${edition.release.slug}.json`), JSON.stringify(edition, null, 2) + '\n');
      console.log(`  ${edition.release.name}: ${features} features printed. ${llm.calls} model calls${llm.costReported ? `, $${llm.cost.toFixed(4)}` : ''}.`);
      built.push(`${edition.release.name}, ${features} features`);
    }
  } catch (err) {
    const why = (err as Error).message.slice(0, 200);
    failures.push(`${one.number}: ${why}`);
    runLog.stop(why);
    console.warn(`  ${one.number} could not be built (${why}). What was saved before is kept, and it is tried again on the next run.`);
  }
  const at = new Date().toISOString();
  spent(llm, at);
  runLog.save({ llm, ...(llm.calls > 0 ? { statsAt: at } : {}) });
}
report(failures.length ? 'failed' : built.length ? 'built' : 'nothing-owed', failures.length ? failures.join('; ') : built.join('; ') || undefined);
process.exit(failures.length ? 1 : 0);
