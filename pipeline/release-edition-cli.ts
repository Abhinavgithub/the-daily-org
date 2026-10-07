import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { PAPER } from '../src/config';
import { BAR, getReleaseEditions } from '../src/lib/release-store';
import { printed } from '../src/lib/release-edition';
import type { ReleaseStatus } from '../src/lib/logs';
import { readReleases } from '../src/lib/releases';
import { configFromEnv, keepFreeModels, LlmClient } from './llm';
import { RunLog } from './log';
import { buildEdition } from './release-edition';
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

const { values: args } = parseArgs({ options: { release: { type: 'string' }, 'dry-run': { type: 'boolean' }, model: { type: 'string' } } });
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
if (args.release) {
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
  // What the build spent goes among the runs, so that it is counted with the rest of the paper's costs.
  const at = new Date().toISOString();
  if (llm.calls > 0) {
    fs.appendFileSync(STATS, JSON.stringify({ date: today, ranAt: at, kind: 'release', llmCalls: llm.calls, retries: llm.retries, tokensByModel: llm.usage, ...(llm.costReported ? { costUsd: Number(llm.cost.toFixed(6)) } : {}) }) + '\n');
  }
  runLog.save({ llm, ...(llm.calls > 0 ? { statsAt: at } : {}) });
}
report(failures.length ? 'failed' : built.length ? 'built' : 'nothing-owed', failures.length ? failures.join('; ') : built.join('; ') || undefined);
process.exit(failures.length ? 1 : 0);
