import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { KEEP, RunLog } from '../../pipeline/log';
import { byNewest, legacyRuns, problems, readLog, staleEditions, summary } from './logs';

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
    '1 proof-read discarded',
    '1 diagram refused',
  ]);
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
