import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { curate, InvalidVerdict, prefilter, proofread } from './curate';
import { addFigures } from './figure';
import { canonicalUrl, forget, GIVE_UP_DAYS, givenUp, loadPending, loadSeen, savePending, saveSeen, transcriptOverdue, waitingSources } from './dedupe';
import { articleText, extractContent, type Extracted } from './extract';
import { routeDown } from './transcript';
import { updateReleases } from './releases';
import { ALERT_FEEDS, readAlerts } from './alerts';
import { NEW_SOURCE_DAYS } from './state';
import { fetchFeeds, type FeedItem } from './fetch';
import { configFromEnv, keepFreeModels, LlmClient, LlmError } from './llm';
import { isBrief } from '../src/lib/editions';
import { RunLog } from './log';
import { PAPER } from '../src/config';
import { addTallies, emptyTally, scorecard, type SourceTally } from '../src/lib/sources';
import { parseRuns } from '../src/lib/stats';
import { SOURCES } from './sources';
import { failingSources, loadState, lookBackDays, recordComplete, recordFailure, recordFetched, recordNewest, saveState } from './state';
import { STORIES_DIR, writeBriefs, writeBulletin, writeStories, type Publishable } from './write';

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    day: { type: 'string' },
    model: { type: 'string' },
    'since-days': { type: 'string' },
    'max-calls': { type: 'string' },
    threshold: { type: 'string' },
    help: { type: 'boolean', default: false },
  },
});

if (args.help) {
  console.log(`Usage: npm run pipeline -- [options]

  --dry-run          Fetch, deduplicate and pre-filter only. No model calls, nothing written.
  --day YYYY-MM-DD   Edition to write into (default: today).
  --model ID         Use this model for the run instead of LLM_MODELS.
  --since-days N     How far back to look in every feed (default: each feed back to its own last success; 7 days for one not yet read in full).
  --max-calls N      Cap on model calls for this run (default: LLM_MAX_CALLS or 40).
  --threshold N      Minimum interest score to publish (default: SCORE_THRESHOLD or 6).`);
  process.exit(0);
}

/** Today's date where the paper is published, whatever clock the machine running this keeps. */
function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: PAPER.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

const day = args.day ?? today();
if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
  console.error(`--day must look like 2026-10-03, got "${day}".`);
  process.exit(1);
}

const seen = loadSeen();
const statsPath = path.join(process.cwd(), 'data', 'stats.jsonl');

// Each feed is read back to its own last success; --since-days overrides that for all of them.
const state = loadState();
const startedAt = new Date();
/** A number from the command line or .env, or the default when neither gives one. Anything that is not a number stops the run. */
function setting(name: string, raw: string | undefined, fallback: number, min: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min) {
    console.error(`${name} must be a number of at least ${min}, got "${raw}".`);
    process.exit(1);
  }
  return value;
}
const override = args['since-days'] === undefined ? undefined : setting('--since-days', args['since-days'], 0, 1);
/** How far back a feed has to be read for nothing to be missed. */
const owed = (source: (typeof SOURCES)[number]) => lookBackDays(state, source.id, startedAt.getTime());
const daysFor = (source: (typeof SOURCES)[number]) => override ?? owed(source);
// Worked out before the run changes anything: the feeds --since-days reads far enough back to count as read in full.
const coveredInFull = new Set(SOURCES.filter((source) => override === undefined || override >= owed(source)).map((source) => source.id));
const maxCalls = setting(args['max-calls'] === undefined ? 'LLM_MAX_CALLS' : '--max-calls', args['max-calls'] ?? process.env.LLM_MAX_CALLS, 40, 1);
const threshold = setting(args.threshold === undefined ? 'SCORE_THRESHOLD' : '--threshold', args.threshold ?? process.env.SCORE_THRESHOLD, 6, 1);
const dryRun = args['dry-run'];
// Articles met by an earlier run and not yet dealt with. Anything that has waited too long is let go.
const pending = loadPending();
if (!dryRun) forget(pending, seen, day);
/** Save what has been handled and what is still waiting. */
const saveProgress = () => {
  saveSeen(seen);
  savePending(pending);
};
// What the run did, article by article, kept for the Logs page. A dry run leaves none.
const runLog = new RunLog('pipeline', day, startedAt);

const spans = new Map<number, number>();
for (const source of SOURCES) spans.set(daysFor(source), (spans.get(daysFor(source)) ?? 0) + 1);
const windows = [...spans.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([days, feeds]) => `${days} day${days === 1 ? '' : 's'} for ${feeds} feed${feeds === 1 ? '' : 's'}`)
  .join(', ');
console.log(`Edition ${day}. Looking back ${windows}.`);

// 1. Fetch
const { items, failures, notes: fetchNotes, newest } = await fetchFeeds(SOURCES, (source) => new Date(startedAt.getTime() - daysFor(source) * 24 * 60 * 60 * 1000));
// Notices printed whatever their score. They are read a fixed way back each time, and one printed before is not printed again.
let alertsError: string | undefined;
if (PAPER.alerts) {
  const read = await readAlerts(PAPER.alerts, new Date(startedAt.getTime() - (override ?? NEW_SOURCE_DAYS) * 24 * 60 * 60 * 1000));
  if ('error' in read) alertsError = read.error;
  else items.push(...read.items);
}
const failed = new Set(failures.map((f) => f.source.id));
for (const source of SOURCES) if (!failed.has(source.id)) recordFetched(state, source.id);
for (const f of failures) recordFailure(state, f.source.id, f.error);
for (const [id, date] of Object.entries(newest)) recordNewest(state, id, date);

// What this run learns about each source, kept in its line of data/stats.jsonl
// so that sources can be compared over time (see `npm run sources`).
const tallies: Record<string, SourceTally> = Object.fromEntries(SOURCES.map((source) => [source.id, emptyTally()]));
const tallyOf = (item: FeedItem) => (tallies[item.source.id] ??= emptyTally());
for (const item of items) tallyOf(item).items++;

/**
 * Save what was learned about the feeds. Only a run that got through
 * everything moves a feed's last success forward; otherwise the same span is
 * read again next time, so nothing left over is skipped. A feed that
 * --since-days read less far back than it was owed is not moved either,
 * nor one with an article waiting to be tried again.
 */
function saveSourceState(complete: boolean) {
  // A feed with an article still waiting is not done: its look-back must keep reaching that article.
  const waiting = waitingSources(pending);
  if (complete) recordComplete(state, SOURCES.filter((source) => !failed.has(source.id) && coveredInFull.has(source.id) && !waiting.has(source.id)).map((source) => source.id), startedAt);
  saveState(state);
}

/** Says which sources have earned a second look, going by the last 60 days of runs. */
function noteSourcesToLookAt() {
  const since = new Date(startedAt.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const history = parseRuns(fs.readFileSync(statsPath, 'utf8')).filter((run) => run.date >= since);
  const look = scorecard(SOURCES, addTallies(history.map((run) => run.sources)), state, startedAt.getTime()).filter((row) => row.verdict.look);
  if (look.length) console.log(`\n${look.length} source${look.length === 1 ? ' needs' : 's need'} a look (${look.map((row) => row.name).join(', ')}): npm run sources`);
}

/** Feeds that keep failing drop out of the paper quietly unless someone is told. */
function warnAboutFailingFeeds() {
  const names = new Map(SOURCES.map((source) => [source.id, source]));
  for (const [id, entry] of failingSources(state)) {
    const source = names.get(id);
    if (!source) continue;
    console.warn(
      `\nWARNING: ${source.name} has failed ${entry.failures} runs in a row (${entry.lastError}). ` +
        `Last read successfully: ${entry.lastSuccessAt?.slice(0, 10) ?? 'never'}. ` +
        `Check its address in paper.config.ts: ${source.url}`,
    );
  }
}

for (const note of fetchNotes) console.log(`  ${note}`);
for (const f of failures) {
  const streak = state[f.source.id].failures;
  console.warn(`  Feed failed${streak > 1 ? ` (${streak} runs in a row)` : ''}: ${f.source.name}: ${f.error}`);
}
if (alertsError) console.warn(`  Alerts could not be read (${alertsError}). The edition is written without them.`);
console.log(`Fetched ${items.length} recent items from ${SOURCES.length - failures.length} feeds.`);
if (PAPER.alerts) {
  const feed = ALERT_FEEDS[PAPER.alerts].source;
  runLog.feed({ id: feed.id, name: feed.name, items: items.filter((item) => item.alert).length, error: alertsError });
}
for (const source of SOURCES) {
  runLog.feed({
    id: source.id,
    name: source.name,
    items: items.filter((item) => item.source.id === source.id).length,
    error: failures.find((f) => f.source.id === source.id)?.error,
    note: fetchNotes.find((note) => note.startsWith(`${source.name}: `))?.slice(source.name.length + 2),
  });
}

// The dates of the coming releases, for the Bulletin. Never a reason to stop.
if (PAPER.releases && !dryRun) {
  const read = await updateReleases(PAPER.releases);
  if ('error' in read) console.warn(`  Release dates could not be read (${read.error}). The dates already known are kept.`);
  else console.log(`Release dates read: ${read.releases.map((release) => `${release.name} from ${release.stages[0].from}`).join('; ')}.`);
}

// 2. Deduplicate, within this run and against earlier runs
const fresh: { item: FeedItem; key: string }[] = [];
const inRun = new Set<string>();
for (const item of items) {
  const key = canonicalUrl(item.url);
  if (seen[key] || inRun.has(key)) continue;
  inRun.add(key);
  fresh.push({ item, key });
  // Counted once, on the run that first met it, however many runs it waits through.
  if (!pending[key]) tallyOf(item).new++;
}
console.log(`${fresh.length} ${fresh.length === 1 ? 'is' : 'are'} new.`);

// 3. Extract and pre-filter
const candidates: { item: FeedItem; key: string; text: string; image?: string; basis?: Extracted['basis'] }[] = [];
let filtered = 0;
// Everything is read before anything is decided, because whether a video waits
// for its transcript depends on how the run's other videos fared.
const extracted: { item: FeedItem; key: string; content: Extracted }[] = [];
// An alert is its own text: there is no article behind it to read.
for (const { item, key } of fresh) extracted.push({ item, key, content: item.alert ? { text: item.feedText, authors: [] } : await extractContent(item) });

// Videos: how many were read from a transcript, how many from a description alone, and how many wait.
const videos = { transcript: 0, description: 0, waiting: 0 };
const refusal = extracted.find(({ content }) => content.transcript === 'failed')?.content.transcriptReason;
const transcriptsDown = routeDown(extracted.flatMap(({ content }) => (content.basis ? [content.basis === 'transcript' ? 'ok' : (content.transcript ?? 'none')] : [])));
if (transcriptsDown) {
  console.warn(`  Video transcripts could not be fetched (${refusal}). Videos are judged on their descriptions in this run.`);
  runLog.transcriptsDown(refusal ?? 'refused');
}

for (const { item, key, content } of extracted) {
  const { text, image, authors, pageFailed, basis } = content;
  // The page's own byline beats the feed's, which is often whoever published the post.
  if (authors.length) item.authors = authors;
  // A video with no transcript yet waits for one: captions often come some hours after the upload, and one
  // refusal among successes is passing trouble. It does not wait when every request was refused, when its
  // captions are in another language, or once it has waited long enough.
  // A live event that has not been held has nothing in it to judge. It is left alone until it has been.
  if (content.transcript === 'upcoming') {
    videos.waiting++;
    console.log(`  Not held yet, left until it has been: ${item.title}`);
    // Said once, on the run that first met it, not on every run until the day.
    if (pending[key]?.why !== 'upcoming') runLog.article({ title: item.title, url: item.url, source: item.source.name, outcome: 'deferred', reason: 'a live event that has not been held yet', awaiting: 'airing' });
    if (!dryRun && pending[key]?.why !== 'upcoming') pending[key] = { source: item.source.id, since: day, why: 'upcoming' };
    continue;
  }
  // Once held, its wait for a transcript starts from now, not from when it was announced.
  const aired = pending[key]?.why === 'upcoming';
  const mayCome = content.transcript === 'none' || (content.transcript === 'failed' && !transcriptsDown);
  if (mayCome && (aired || !transcriptOverdue(pending[key], day))) {
    if (aired && !dryRun) delete pending[key];
    videos.waiting++;
    if (!dryRun) pending[key] ??= { source: item.source.id, since: day, why: 'no-transcript' };
    console.log(`  Waiting for its transcript: ${item.title}`);
    runLog.article({ title: item.title, url: item.url, source: item.source.name, outcome: 'deferred', reason: 'no transcript yet, to be tried again next run', awaiting: 'transcript' });
    continue;
  }
  if (basis) videos[basis]++;
  // An alert is short by nature and is not held to the rules for articles.
  let reason = item.alert ? null : prefilter(item, text);
  if (reason) {
    filtered++;
    // Too short only because its page could not be read: leave it unseen, so the next run tries the page
    // again, until it has been tried for long enough.
    const retry = pageFailed && reason === 'too short' && !givenUp(pending[key], day);
    if (pageFailed && reason === 'too short') reason = retry ? 'its page could not be read, to be tried again next run' : `its page could not be read for ${GIVE_UP_DAYS} days`;
    if (!dryRun) {
      if (retry) {
        if (!pending[key]) tallyOf(item).unread++;
        pending[key] ??= { source: item.source.id, since: day, why: 'unread' };
      } else {
        // An article given up on was counted as unread when first met.
        if (!pending[key]) tallyOf(item).dropped++;
        seen[key] = day;
        delete pending[key];
      }
    }
    console.log(`  Dropped (${reason}): ${item.title}`);
    runLog.article({ title: item.title, url: item.url, source: item.source.name, outcome: 'dropped', reason, ...(basis ? { basis } : {}) });
  } else {
    candidates.push({ item, key, text, image, basis });
  }
}
console.log(`${candidates.length} passed the pre-filter, ${filtered} dropped${videos.waiting ? `, ${videos.waiting} waiting for a transcript` : ''}.`);
if (videos.transcript + videos.description > 0) console.log(`Videos: ${videos.transcript} read from a transcript, ${videos.description} from a description alone.`);

if (dryRun) {
  for (const { item, text, basis } of candidates) console.log(`  Would assess: [${item.source.name}] ${item.title}${basis ? ` (${basis}, ${text.length} characters)` : ''}${item.alert ? ` (${item.alert.label}: ${item.alert.facts})` : ''}`);
  console.log('Dry run: no model calls made, nothing written.');
  warnAboutFailingFeeds();
  process.exit(0);
}

if (candidates.length === 0) {
  saveProgress();
  saveSourceState(true);
  // Logged like any other run, so a quiet day can be told apart from a run that never happened.
  const quietAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(statsPath), { recursive: true });
  fs.appendFileSync(
    statsPath,
    JSON.stringify({ date: day, ranAt: quietAt, fetched: items.length, new: fresh.length, prefiltered: filtered, assessed: 0, published: 0, llmCalls: 0, videos, sources: tallies, failedFeeds: Object.fromEntries(failures.map((f) => [f.source.id, state[f.source.id].failures])) }) + '\n',
  );
  runLog.save({ statsAt: quietAt });
  console.log(
    fresh.length === 0
      ? `Nothing new: all ${items.length} items in the window were handled by earlier runs. No edition written.`
      : `Nothing to assess: every new item was dropped by the pre-filter${videos.waiting ? ' or is waiting for its transcript' : ''}. No edition written.`,
  );
  warnAboutFailingFeeds();
  noteSourcesToLookAt();
  process.exit(0);
}

// 4. Curate
const config = configFromEnv({ model: args.model });
if (!config.apiKey) {
  console.error('LLM_API_KEY is not set. Copy .env.example to .env and add a key (for OpenRouter, from https://openrouter.ai/keys).');
  process.exit(1);
}
const { models, notes } = await keepFreeModels(config, process.env.LLM_ALLOW_PAID === '1');
for (const note of notes) console.warn(`  ${note}`);
if (models.length === 0) {
  console.error('No usable model left. Run `npm run models` to pick a free one, then set LLM_MODELS or pass --model.');
  process.exit(1);
}
const llm = new LlmClient({ ...config, models, log: (message) => console.warn(`      extra call, ${message}`) });
console.log(`Assessing with ${models.join(', then ')}${config.imageModel ? `, illustrating with ${config.imageModel}` : ''}. Cap: ${maxCalls} calls${config.maxCostUsd ? `, $${config.maxCostUsd}` : ''}.`);

// Each story is proof-read and written as soon as it is accepted, so a run that
// is interrupted keeps everything it has paid for.
const written: string[] = [];
const briefs: string[] = [];
// What went to the Bulletin, apart from the stories: alerts and tools' releases.
const bulletin: string[] = [];
let figures = { made: 0, illustrated: 0, none: 0, rejected: 0, skipped: 0 };
const counts = { rejected: 0, belowThreshold: 0, invalid: 0, deferred: 0 };
const proofs = { corrected: 0, unchanged: 0, kept: 0, skipped: 0 };
const modelsUsed = new Set<string>();
let stopped = false;
// Articles in a row that every model refused. One is an article the models will not take; two is more likely the
// account or the settings, so the run stops and both are left for next time.
let refusedInARow: { key: string; url: string; source: string }[] = [];

/** 5. Proof-read a story that is about to be published, if the limits allow. */
async function proofreadStory(story: Publishable) {
  const v = story.curated.verdict;
  const limit = stopped ? 'the run had stopped' : llm.limitReached(maxCalls);
  if (limit) {
    proofs.skipped++;
    runLog.proofread({ title: v.title, outcome: 'skipped', reason: limit });
    return;
  }
  const result = await proofread(llm, { title: v.title, why_read: v.why_read, summary: v.summary });
  proofs[result.outcome]++;
  Object.assign(v, result.copy);
  if (result.reason && result.outcome !== 'skipped') console.warn(`  Proof-reading partly discarded (${result.reason}): ${v.title}`);
  runLog.proofread({ title: v.title, outcome: result.outcome, reason: result.reason });
  if (result.outcome === 'skipped') {
    stopped = true;
    runLog.stop(result.reason ?? 'the model was unavailable during proof-reading');
  }
}

/**
 * Write the run's line in data/stats.jsonl and its log, with whatever has
 * happened so far. It is called once: at the end, or the moment the run is cut
 * short, so that an interrupted run still leaves a record of what it paid for.
 */
let recordedAt = '';
function record(cutShort?: string): string {
  if (recordedAt) return recordedAt;
  recordedAt = new Date().toISOString();
  if (cutShort) {
    runLog.stop(cutShort);
    // What the run did not reach waits like anything else left over, so the next run does not count it as new again.
    for (const { item, key } of candidates) if (!seen[key]) pending[key] ??= { source: item.source.id, since: day, why: 'deferred' };
  }
  saveProgress();
  const stats = {
    date: day,
    ranAt: recordedAt,
    fetched: items.length,
    new: fresh.length,
    prefiltered: filtered,
    assessed: tallied((tally) => tally.reviewed) + counts.invalid,
    published: written.length,
    notRelevant: counts.rejected,
    belowThreshold: counts.belowThreshold,
    // How many of those were close enough to be printed in brief.
    briefs: briefs.length,
    // Alerts and tools' releases, which are printed in the Bulletin and not among the stories.
    bulletin: bulletin.length,
    invalidReplies: counts.invalid,
    deferred: cutShort ? candidates.length - tallied((tally) => tally.reviewed) - counts.invalid : counts.deferred,
    llmCalls: llm.calls,
    retries: llm.retries,
    proofread: proofs,
    figures,
    // Videos read from a transcript, from a description alone, and left waiting for a transcript.
    videos,
    models: [...modelsUsed],
    // Every reply is counted, proof-reading and diagrams included.
    inputTokens: Object.values(llm.usage).reduce((sum, spent) => sum + spent.input, 0),
    outputTokens: Object.values(llm.usage).reduce((sum, spent) => sum + spent.output, 0),
    tokensByModel: llm.usage,
    sources: tallies,
    // What the provider said the run cost, in US dollars. Left out when it did not say; nought is a run on a free model.
    ...(llm.costReported ? { costUsd: Number(llm.cost.toFixed(6)) } : {}),
    failedFeeds: Object.fromEntries(failures.map((f) => [f.source.id, state[f.source.id].failures])),
  };
  fs.mkdirSync(path.dirname(statsPath), { recursive: true });
  fs.appendFileSync(statsPath, JSON.stringify(stats) + '\n');
  runLog.save({ llm, statsAt: recordedAt });
  return recordedAt;
}
const tallied = (pick: (tally: SourceTally) => number) => Object.values(tallies).reduce((sum, tally) => sum + pick(tally), 0);

// Stopped from the keyboard or by the system: say so in the record, and leave.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    saveState(state);
    record(`interrupted (${signal})`);
    console.warn(`\nInterrupted. What was done is saved and recorded; the rest is left for the next run.`);
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
}

/** Tokens the run has used so far, for charging each article's share to its source. */
const tokensSoFar = () => Object.values(llm.usage).reduce((sum, spent) => sum + spent.input + spent.output, 0);

try {
for (const [i, { item, key, text, image, basis }] of candidates.entries()) {
  const entry = { title: item.title, url: item.url, source: item.source.name, ...(basis ? { basis } : {}) };
  const tally = tallyOf(item);
  const before = tokensSoFar();
  const limit = llm.limitReached(maxCalls);
  if (stopped || limit) {
    counts.deferred++;
    pending[key] ??= { source: item.source.id, since: day, why: 'deferred' };
    if (!stopped && limit) runLog.stop(limit);
    runLog.article({ ...entry, outcome: 'deferred' });
    continue;
  }
  try {
    const curated = await curate(llm, item, text);
    refusedInARow = [];
    modelsUsed.add(curated.model);
    seen[key] = day;
    delete pending[key];
    const v = curated.verdict;
    tally.reviewed++;
    tally.scores.push(v.interest_score);
    // An alert is printed whatever it scores. One that is not about security is still left to the editor's view of whether it belongs.
    const waived = item.alert !== undefined && (v.relevant || item.alert.always);
    if (waived) {
      console.log(`  [${i + 1}/${candidates.length}] ${item.alert!.label}, for the Bulletin: ${item.title}`);
      runLog.article({ ...entry, title: v.title, outcome: 'published', score: v.interest_score, reason: `printed in the Bulletin as an alert (${item.alert!.label.toLowerCase()}), whatever its score` });
      const story = { item, curated, image };
      await proofreadStory(story);
      bulletin.push(...writeBulletin(day, 'alert', [story]));
      tally.published++;
    } else if (item.source.type === 'code') {
      // Every release of a tool is printed, as one line in the Bulletin: a reader should not have to wonder whether there was one.
      console.log(`  [${i + 1}/${candidates.length}] A release, for the Bulletin: ${item.title}`);
      runLog.article({ ...entry, title: v.title, outcome: 'published', score: v.interest_score, reason: 'printed in the Bulletin; every release of a tool is' });
      bulletin.push(...writeBulletin(day, 'release', [{ item, curated }]));
      tally.published++;
    } else if (item.source.type === 'discussion' && v.relevant) {
      // A forum post is never a story. One the editor finds worth knowing is a line in the Bulletin, whatever it scores:
      // a post is not written to be read as an article is, and its score says little.
      console.log(`  [${i + 1}/${candidates.length}] From the community, for the Bulletin: ${item.title}`);
      runLog.article({ ...entry, title: v.title, outcome: 'published', score: v.interest_score, reason: 'printed in the Bulletin, as a line from the community' });
      bulletin.push(...writeBulletin(day, 'community', [{ item, curated }]));
      tally.published++;
    } else if (!v.relevant) {
      counts.rejected++;
      tally.notRelevant++;
      console.log(`  [${i + 1}/${candidates.length}] Not relevant: ${item.title}`);
      runLog.article({ ...entry, outcome: 'not-relevant', score: v.interest_score });
    } else if (v.interest_score < threshold) {
      counts.belowThreshold++;
      tally.below++;
      // A close call is not thrown away: it is printed in brief, as the model wrote it, at no further cost.
      const brief = isBrief(v, threshold);
      if (brief) briefs.push(...writeBriefs(day, [{ item, curated }]));
      console.log(`  [${i + 1}/${candidates.length}] Scored ${v.interest_score}, below ${threshold}${brief ? ', printed in brief' : ''}: ${item.title}`);
      runLog.article({
        ...entry,
        outcome: 'below-threshold',
        score: v.interest_score,
        reason: `scored ${v.interest_score}, the threshold is ${threshold}${brief ? '; printed in brief' : ''}`,
      });
    } else {
      console.log(`  [${i + 1}/${candidates.length}] Scored ${v.interest_score}, publishing: ${item.title}`);
      runLog.article({ ...entry, title: v.title, outcome: 'published', score: v.interest_score, reason: v.title === item.title ? undefined : `article title: ${item.title}` });
      const story = { item, curated, image };
      await proofreadStory(story);
      // 6. Write
      written.push(...writeStories(day, [story]));
      tally.published++;
    }
    saveProgress();
    tally.tokens += tokensSoFar() - before;
  } catch (err) {
    tally.tokens += tokensSoFar() - before;
    if (err instanceof InvalidVerdict && item.alert) {
      // An alert is not given up on for one bad reply: it waits for the next run.
      counts.deferred++;
      delete seen[key];
      pending[key] ??= { source: item.source.id, since: day, why: 'deferred' };
      saveProgress();
      console.warn(`  [${i + 1}/${candidates.length}] Unusable model reply for an alert, to be tried again next run: ${item.title}`);
      runLog.article({ ...entry, outcome: 'deferred', reason: 'unusable model reply; an alert is tried again' });
    } else if (err instanceof InvalidVerdict) {
      counts.invalid++;
      seen[key] = day;
      delete pending[key];
      saveProgress();
      console.warn(`  [${i + 1}/${candidates.length}] Skipped, unusable model reply: ${item.title}`);
      runLog.article({ ...entry, outcome: 'invalid-reply', reason: err.message.replace(/\s+/g, ' ').slice(0, 300) });
    } else if (err instanceof LlmError && err.refused && refusedInARow.length === 0) {
      // Too long for every model, or blocked by them: skip it for good, or every later run would stop here.
      counts.invalid++;
      seen[key] = day;
      refusedInARow.push({ key, url: item.url, source: item.source.id });
      delete pending[key];
      saveProgress();
      console.warn(`  [${i + 1}/${candidates.length}] Skipped, refused by every model: ${item.title}`);
      runLog.article({ ...entry, outcome: 'invalid-reply', reason: `refused by every model: ${err.message.replace(/\s+/g, ' ').slice(0, 260)}` });
    } else if (err instanceof LlmError) {
      // The provider is down or the daily limit is spent. Leave the rest for the next run.
      // An article refused just before is not held against it after all: it waits with the rest.
      for (const refused of refusedInARow) {
        delete seen[refused.key];
        pending[refused.key] ??= { source: refused.source, since: day, why: 'deferred' };
        runLog.amend(refused.url, { outcome: 'deferred', reason: undefined });
      }
      if (refusedInARow.length) {
        counts.invalid -= refusedInARow.length;
        counts.deferred += refusedInARow.length;
        saveProgress();
      }
      console.warn(`  Stopping: ${err.message}`);
      if (/HTTP 401/.test(err.message)) {
        console.warn(
          '  The provider rejected LLM_API_KEY. On OpenRouter, "User not found" usually means the key is a management (provisioning) key, which cannot run models. Create a standard API key at https://openrouter.ai/keys.',
        );
      }
      counts.deferred++;
      pending[key] ??= { source: item.source.id, since: day, why: 'deferred' };
      stopped = true;
      runLog.stop(err.message.slice(0, 300));
      runLog.article({ ...entry, outcome: 'deferred' });
    } else {
      throw err;
    }
  }
}

saveProgress();
saveSourceState(!stopped && counts.deferred === 0);

// 7. A diagram for each must-read story of the edition that has none
// It is drawn from the article's own text: what this run read, or the page again for a story from an earlier run.
const read = new Map(candidates.map(({ item, text }) => [item.url, text]));
const readArticle = async (url: string) => read.get(url) || articleText(url);
if (written.length && !stopped) figures = await addFigures(llm, day, { maxCalls, readArticle, log: console.log, record: (entry) => runLog.figure(entry) });
} catch (err) {
  // Something unforeseen. What was done stays done; record it before the error is reported.
  saveState(state);
  record(`stopped by an error: ${(err as Error).message.slice(0, 200)}`);
  throw err;
}

record();

console.log(
  `\nPublished ${written.length} to ${path.relative(process.cwd(), path.join(STORIES_DIR, day))}. ` +
    `${counts.rejected} not relevant, ${counts.belowThreshold} below threshold, ${counts.invalid} unusable replies, ` +
    `${counts.deferred} left for the next run.${briefs.length ? ` ${briefs.length} printed in brief.` : ''}${bulletin.length ? ` ${bulletin.length} printed in the Bulletin.` : ''} ${llm.calls} model calls${llm.cost ? `, $${llm.cost.toFixed(4)}` : ''}.`,
);
if (written.length) {
  console.log(
    `Proof-reading: ${proofs.corrected} corrected, ${proofs.unchanged} needed nothing, ${proofs.kept} kept as written, ` +
      `${proofs.skipped} not proof-read.`,
  );
  console.log(`Diagrams: ${figures.made} drawn, ${figures.illustrated} illustrated, ${figures.none} with nothing to draw, ${figures.rejected} discarded, ${figures.skipped} skipped.`);
}
const extra = Object.entries(llm.retries);
if (extra.length) {
  console.log(`Extra calls: ${extra.map(([cause, n]) => `${n} ${cause}`).join(', ')}.`);
}
if (written.length) console.log('If the site is open in `npm run dev` and the new stories do not appear, restart it (npx astro dev stop, then npm run dev).');
warnAboutFailingFeeds();
noteSourcesToLookAt();
