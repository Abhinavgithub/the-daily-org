import assert from 'node:assert/strict';
import { test } from 'node:test';
import { daysBetween, forget, givenUp, transcriptOverdue, waitingSources } from './dedupe';
import { failingSources, lookBackDays, recordComplete, recordFailure, recordFetched, type State } from './state';

test('each feed is read back to its own last success', () => {
  const now = Date.parse('2026-10-10T12:00:00Z');
  const state: State = {};
  assert.equal(lookBackDays(state, 'new-feed', now), 7, 'no record yet');

  recordComplete(state, ['daily'], new Date('2026-10-10T06:00:00Z'));
  assert.equal(lookBackDays(state, 'daily', now), 2, 'read this morning: the minimum');
  recordComplete(state, ['yesterday'], new Date('2026-10-09T06:00:00Z'));
  assert.equal(lookBackDays(state, 'yesterday', now), 3, 'a day and a bit, plus a day of margin');
  recordComplete(state, ['long-outage'], new Date('2026-09-10T06:00:00Z'));
  assert.equal(lookBackDays(state, 'long-outage', now), 32, 'the whole outage is covered');
});

test('failed runs are counted, and a feed that keeps failing is flagged', () => {
  const state: State = {};
  recordComplete(state, ['flaky', 'dead'], new Date('2026-10-01T06:00:00Z'));

  recordFailure(state, 'dead', 'HTTP 404');
  recordFailure(state, 'dead', 'HTTP 404');
  recordFailure(state, 'flaky', 'HTTP 500');
  assert.deepEqual(failingSources(state), [], 'two failures are not yet a pattern');

  recordFetched(state, 'flaky');
  recordFailure(state, 'dead', 'HTTP 410');
  assert.deepEqual(failingSources(state).map(([id]) => id), ['dead']);
  assert.equal(state.dead.failures, 3);
  assert.equal(state.dead.lastError, 'HTTP 410');
  assert.equal(state.flaky.failures, 0, 'a successful fetch ends the streak');

  // Fetching alone does not move the last success: only a run that got through everything does.
  assert.equal(state.flaky.lastSuccessAt, '2026-10-01T06:00:00.000Z');
  // A failing feed keeps its old date, so its look-back keeps growing to cover the gap.
  assert.equal(lookBackDays(state, 'dead', Date.parse('2026-10-20T06:00:00Z')), 20);
});

test('an article that is waiting is tried for a few days, then let go', () => {
  const waiting = { source: 'a', since: '2026-10-01', why: 'unread' as const };
  assert.equal(daysBetween('2026-09-29', '2026-10-02'), 3);
  assert.equal(givenUp(undefined, '2026-10-04'), false, 'met for the first time');
  assert.equal(givenUp(waiting, '2026-10-03'), false);
  assert.equal(givenUp(waiting, '2026-10-04'), true);

  // Anything that has waited a week is moved to `seen`, so a feed is not held back for ever by an article that has left it.
  const pending = { 'https://x/old': { ...waiting, since: '2026-09-20' }, 'https://x/new': { source: 'b', since: '2026-10-03', why: 'deferred' as const } };
  const seen: Record<string, string> = {};
  assert.deepEqual(forget(pending, seen, '2026-10-04'), ['https://x/old']);
  assert.deepEqual(seen, { 'https://x/old': '2026-10-04' });
  assert.deepEqual([...waitingSources(pending)], ['b']);
});

test('a video waits two days for its transcript, then is judged without it', () => {
  const waiting = { source: 'yt', since: '2026-10-01', why: 'no-transcript' as const };
  assert.equal(transcriptOverdue(undefined, '2026-10-01'), false, 'met for the first time');
  assert.equal(transcriptOverdue(waiting, '2026-10-02'), false);
  assert.equal(transcriptOverdue(waiting, '2026-10-03'), true);
});
