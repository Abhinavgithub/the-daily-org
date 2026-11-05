import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { KEEP, RunLog } from '../../pipeline/log';
import { byNewest, legacyRuns, notes, problems, proofFate, readLog, readReleaseStatus, runDays, runId, runMark, staleEditions, summary, type RunLogData } from './logs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'paper-logs-'));

/** A run with one of everything. */
function sample(startedAt = new Date('2026-10-05T06:00:00Z')) {
  const log = new RunLog('pipeline', '2026-10-05', startedAt);
  log.feed({ id: 'a', name: 'Feed A', items: 4 });
  log.feed({ id: 'b', name: 'Feed B', items: 0, error: 'HTTP 403 (5 attempts)' });
  log.article({ title: 'Kept', url: 'https://x/1', source: 'Feed A', outcome: 'published', score: 8 });
  log.article({ title: 'Dull', url: 'https://x/2', source: 'Feed A', outcome: 'below-threshold', score: 4 });
  log.article({ title: 'Short', url: 'https://x/3', source: 'Feed A', outcome: 'dropped', reason: 'too short' });
  log.article({ title: 'Garbled', url: 'https://x/4', source: 'Feed A', outcome: 'invalid-reply', reason: 'no JSON object found' });
  log.article({ title: 'Later', url: 'https://x/5', source: 'Feed A', outcome: 'deferred' });
  log.proofread({ title: 'Kept', outcome: 'kept', reason: '"360" was changed or removed' });
  log.figure({ title: 'Kept', outcome: 'refused', reason: 'a number not in the story' });
  log.stop('the cap of 40 model calls was reached');
  log.stop('a later reason');
  return log;
}

test('a run is written, read back and summarised', () => {
  const dir = tmp();
  const file = sample().save({ dir, statsAt: 's1', now: new Date('2026-10-05T06:03:00Z') });
  const log = readLog(fs.readFileSync(file, 'utf8'))!;
  assert.equal(log.seconds, 180);
  assert.equal(log.finished, false);
  assert.equal(log.stopped, 'the cap of 40 model calls was reached', 'the first reason is kept');
  assert.deepEqual(summary(log), { fetched: 4, reviewed: 3, published: 1, calls: 0 });
  assert.deepEqual(problems(log), [
    'stopped early: the cap of 40 model calls was reached',
    '1 feed failed',
    '1 unusable model reply',
    '1 diagram refused',
  ]);
  assert.deepEqual(notes(log), ['1 proof-read not used: the story was printed as written'], 'a refused proof-read did no harm');
  assert.deepEqual(problems(readLog('{"ranAt":"2026-10-05T06:00:00Z"}')!), [], 'missing parts are read as empty');

  assert.equal(readLog('not json'), null);
  assert.equal(readLog('{"ranAt":"never"}'), null);
});

test('only the newest logs are kept', () => {
  const dir = tmp();
  for (let i = 0; i < KEEP + 3; i++) new RunLog('figures', '', new Date(Date.UTC(2026, 0, 1, 0, i))).save({ dir });
  const files = fs.readdirSync(dir).sort();
  assert.equal(files.length, KEEP);
  assert.ok(files[0].startsWith('2026-01-01T00-03'), 'the three oldest were removed');
});

test('runs from before logs were kept appear with totals only', () => {
  const stats = [
    '{"date":"2026-10-03","ranAt":"2026-10-03T16:04:54Z","fetched":24,"assessed":12,"published":3,"deferred":0,"llmCalls":21,"failedFeeds":[]}',
    '{"date":"2026-10-04","ranAt":"2026-10-04T03:04:53Z","fetched":13,"assessed":0,"published":0,"llmCalls":0,"failedFeeds":["yt-a"]}',
    '{"date":"2026-10-04","ranAt":"2026-10-04T03:45:47Z","fetched":59,"assessed":14,"published":7,"deferred":12,"llmCalls":40,"retries":{"HTTP 429":24},"failedFeeds":{}}',
    '{"date":"2026-10-05","ranAt":"s1","fetched":1}',
    'broken',
  ].join('\n');
  const runs = legacyRuns(stats, new Set(['2026-10-04T03:45:47Z'])).sort(byNewest);
  assert.deepEqual(runs.map((run) => run.ranAt), ['2026-10-04T03:04:53Z', '2026-10-03T16:04:54Z'], 'a run with its own log, and lines that are not runs, are left out');
  assert.deepEqual(summary(runs[1]), { fetched: 24, reviewed: 12, published: 3, calls: 21 });
  assert.deepEqual(problems(runs[0]), ['1 feed failed']);
  assert.deepEqual(problems(runs[1]), []);
  const stopped = legacyRuns(stats, new Set())[2];
  assert.deepEqual(problems(stopped), ['stopped early: 12 left for the next run']);
});

test('editions the site is serving out of date are found', () => {
  assert.deepEqual(staleEditions({ '2026-10-03': 6, '2026-10-04': 21 }, { '2026-10-03': 6, '2026-10-04': 9 }), [{ day: '2026-10-04', onDisk: 21, served: 9 }]);
  assert.deepEqual(staleEditions({ '2026-10-05': 4 }, { '2026-10-03': 6 }), [
    { day: '2026-10-05', onDisk: 4, served: 0 },
    { day: '2026-10-03', onDisk: 0, served: 6 },
  ]);
  assert.deepEqual(staleEditions({ '2026-10-04': 21 }, { '2026-10-04': 21 }), []);
});

test('an illustration that could not be made is a problem of its run, and a run has a name to be linked by', () => {
  const log = readLog('{"ranAt":"2026-10-04T10:37:30.625Z","figures":[{"title":"A","outcome":"drawn","image":"failed"},{"title":"B","outcome":"drawn","image":"made"}]}')!;
  assert.deepEqual(problems(log), ['1 illustration not made']);
  assert.equal(runId(log.ranAt), 'run-2026-10-04T10-37-30-625Z');
});

test('what a run read from outside is kept, a failure is one of its problems, and a release build is a run of its own kind', () => {
  const log = readLog(JSON.stringify({ ranAt: '2026-10-07T06:30:00Z', kind: 'release', checks: [{ name: 'The share price', ok: false, says: 'HTTP 429' }, { name: 'Release dates', ok: true }, { nope: 1 }] }))!;
  assert.equal(log.kind, 'release');
  assert.equal(log.checks?.length, 2);
  assert.deepEqual(problems(log), ['The share price could not be read (HTTP 429)']);
  assert.deepEqual(readReleaseStatus('{"at":"2026-10-07T06:40:00Z","outcome":"built","says":"x"}'), { at: '2026-10-07T06:40:00Z', outcome: 'built', says: 'x' });
  assert.equal(readReleaseStatus('{"at":"2026-10-07T06:40:00Z","outcome":"other"}'), undefined);
  assert.equal(readReleaseStatus(''), undefined);
});

test('a run says what started it on GitHub, and a run elsewhere says nothing of it', (t) => {
  const was = process.env.GITHUB_EVENT_NAME;
  t.after(() => (was === undefined ? delete process.env.GITHUB_EVENT_NAME : (process.env.GITHUB_EVENT_NAME = was)));
  const dir = tmp();
  process.env.GITHUB_EVENT_NAME = 'schedule';
  assert.equal(readLog(fs.readFileSync(sample().save({ dir }), 'utf8'))!.trigger, 'schedule');
  delete process.env.GITHUB_EVENT_NAME;
  assert.equal(readLog(fs.readFileSync(sample(new Date('2026-10-06T06:00:00Z')).save({ dir }), 'utf8'))!.trigger, undefined);
});

/** A finished run with nothing in it but these proof-reads, as the log file records them. */
const proofRun = (proofread: object[], ranAt = '2026-10-05T06:00:00Z') => readLog(JSON.stringify({ ranAt, finished: true, proofread, model: { calls: 3, retries: {}, usage: {} } }))!;

test('each proof-read outcome the pipeline records is a problem, a note or nothing, and says what was printed', () => {
  // One of each, with reasons as pipeline/curate.ts writes them.
  const cases = [
    { proof: { title: 'A', outcome: 'skipped', reason: 'the cap of 40 model calls was reached' }, fate: 'not-read', problems: ['1 story not proof-read'], notes: [], mark: 'Problems' },
    { proof: { title: 'B', outcome: 'skipped' }, fate: 'fine', problems: [], notes: [], mark: 'Fine' },
    { proof: { title: 'C', outcome: 'kept', reason: 'summary: "account" was removed' }, fate: 'refused', problems: [], notes: ['1 proof-read not used: the story was printed as written'], mark: 'Fine, a note' },
    { proof: { title: 'D', outcome: 'kept', reason: 'the reply was not usable' }, fate: 'refused', problems: [], notes: ['1 proof-read not used: the story was printed as written'], mark: 'Fine, a note' },
    { proof: { title: 'E', outcome: 'corrected', reason: 'summary: 8 words differ (at most 6 allowed)' }, fate: 'partly', problems: [], notes: ['1 proof-read partly used: a refused change was put back as written, the rest printed corrected'], mark: 'Fine, a note' },
    { proof: { title: 'F', outcome: 'corrected' }, fate: 'fine', problems: [], notes: [], mark: 'Fine' },
    { proof: { title: 'G', outcome: 'unchanged' }, fate: 'fine', problems: [], notes: [], mark: 'Fine' },
  ];
  for (const c of cases) {
    const log = proofRun([c.proof]);
    const name = `${c.proof.outcome}${c.proof.reason ? ` (${c.proof.reason})` : ''}`;
    assert.equal(proofFate(log.proofread[0]), c.fate, name);
    assert.deepEqual(problems(log), c.problems, name);
    assert.deepEqual(notes(log), c.notes, name);
    assert.equal(runMark(log).label, c.mark, name);
  }

  // Counted together, and a problem outranks a note.
  const mixed = proofRun(cases.map((c) => c.proof));
  assert.deepEqual(notes(mixed), ['2 proof-reads not used: the stories were printed as written', '1 proof-read partly used: a refused change was put back as written, the rest printed corrected']);
  assert.deepEqual(runMark(mixed), { tone: 'bad', label: 'Problems' });
});

test('the Runs timeline has a day for each day asked, coloured by problems only', () => {
  const noted = proofRun([{ title: 'C', outcome: 'kept', reason: 'summary: "account" was removed' }], '2026-11-03T06:31:00Z');
  const broken = proofRun([{ title: 'A', outcome: 'skipped', reason: 'the cap was reached' }], '2026-11-04T06:31:00Z');
  const again = proofRun([], '2026-11-04T09:00:00Z');
  const cost: Record<string, number> = { [noted.ranAt]: 0.02, [broken.ranAt]: 0.03 };
  const days = runDays([noted, broken, again], ['2026-11-02', '2026-11-03', '2026-11-04'], (iso) => iso.slice(0, 10), (log: RunLogData) => cost[log.ranAt]);

  assert.deepEqual(days.map((d) => [d.day, d.runs.length, d.problems]), [['2026-11-02', 0, 0], ['2026-11-03', 1, 0], ['2026-11-04', 2, 1]]);
  assert.equal(days[0].latest, undefined, 'a day with no run is a gap');
  assert.equal(days[1].problems, 0, 'a day with only a note is not drawn as one with problems');
  assert.equal(days[2].latest, again, "the column opens the day's latest run");
  assert.equal(days[2].cost, 0.03, 'an unpriced run adds nothing');
  assert.equal(days[2].unpriced, false);
  assert.equal(days[2].calls, 6);
  assert.equal(runDays([again], ['2026-11-04'], (iso) => iso.slice(0, 10), () => undefined)[0].unpriced, true);
});
