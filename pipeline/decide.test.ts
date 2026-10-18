import assert from 'node:assert/strict';
import { test } from 'node:test';
import { route, triage } from './decide';
import type { FeedItem } from './fetch';
import { item } from './testing';

const day = '2026-10-18';
const long = 'An article long enough to be read in full. '.repeat(30);
const video: FeedItem = { ...item, source: { ...item.source, type: 'video' } };
const alert: FeedItem = { ...item, alert: { label: 'Incident', facts: 'Resolved', always: false } };

test('an article long enough is assessed, and one too short is dropped for good', () => {
  assert.deepEqual(triage(item, { text: long, authors: [] }, undefined, day, false), { kind: 'assess' });
  assert.deepEqual(triage(item, { text: 'Short.', authors: [] }, undefined, day, false), { kind: 'drop', reason: 'too short', retry: false });
});

test('an article short only because its page could not be read is tried again, until it has been tried long enough', () => {
  const unread = { text: 'Short.', authors: [], pageFailed: true };
  assert.deepEqual(triage(item, unread, undefined, day, false), { kind: 'drop', reason: 'its page could not be read, to be tried again next run', retry: true });
  const since = { source: 'test', since: '2026-10-14', why: 'unread' as const };
  assert.deepEqual(triage(item, unread, since, day, false), { kind: 'drop', reason: 'its page could not be read for 3 days', retry: false });
});

test('an alert is assessed however short it is', () => {
  assert.deepEqual(triage(alert, { text: 'Short.', authors: [] }, undefined, day, false), { kind: 'assess' });
});

test('a live event not yet held is left alone, and said to be so only the first time', () => {
  const upcoming = { text: '', authors: [], transcript: 'upcoming' as const };
  assert.deepEqual(triage(video, upcoming, undefined, day, false), { kind: 'upcoming', firstMet: true });
  assert.deepEqual(triage(video, upcoming, { source: 'test', since: '2026-10-01', why: 'upcoming' }, day, false), { kind: 'upcoming', firstMet: false });
});

test('a video waits for its transcript, but not when every request was refused, nor once it has waited long enough', () => {
  const none = { text: long, authors: [], transcript: 'none' as const, basis: 'description' as const };
  const failed = { ...none, transcript: 'failed' as const };
  assert.deepEqual(triage(video, none, undefined, day, false), { kind: 'wait', aired: false });
  assert.deepEqual(triage(video, failed, undefined, day, false), { kind: 'wait', aired: false });
  assert.deepEqual(triage(video, failed, undefined, day, true), { kind: 'assess' });
  assert.deepEqual(triage(video, none, { source: 'test', since: '2026-10-15', why: 'no-transcript' }, day, false), { kind: 'assess' });
  // A held event's wait starts when it is held, however long ago it was announced.
  assert.deepEqual(triage(video, none, { source: 'test', since: '2026-09-01', why: 'upcoming' }, day, false), { kind: 'wait', aired: true });
});

const verdict = { relevant: true, interest_score: 7, same_as: null };

test('an article goes to the desk its kind and its verdict call for', () => {
  assert.deepEqual(route(alert, { ...verdict, interest_score: 2 }, [], 6), { desk: 'alert' });
  assert.deepEqual(route(alert, { ...verdict, relevant: false }, [], 6), { desk: 'not-relevant' });
  assert.deepEqual(route({ ...alert, alert: { ...alert.alert!, always: true } }, { ...verdict, relevant: false }, [], 6), { desk: 'alert' });
  assert.deepEqual(route({ ...item, source: { ...item.source, type: 'code' } }, { ...verdict, relevant: false }, [], 6), { desk: 'release' });
  assert.deepEqual(route({ ...item, source: { ...item.source, type: 'discussion' } }, { ...verdict, interest_score: 2 }, [], 6), { desk: 'community' });
  assert.deepEqual(route(item, { ...verdict, relevant: false }, [], 6), { desk: 'not-relevant' });
  assert.deepEqual(route(item, verdict, [], 6), { desk: 'story' });
});

test('a story below the threshold is printed in brief only when it was a close call', () => {
  assert.deepEqual(route(item, { ...verdict, interest_score: 5 }, [], 6), { desk: 'below', brief: true });
  assert.deepEqual(route(item, { ...verdict, interest_score: 2 }, [], 6), { desk: 'below', brief: false });
});

test('a story the edition has already is a line under the better telling', () => {
  const edition = [{ score: 6 }, { score: 8 }];
  assert.deepEqual(route(item, { ...verdict, same_as: 2 }, edition, 6), { desk: 'repeat', of: 1 });
  assert.deepEqual(route(item, { ...verdict, same_as: 1 }, edition, 6), { desk: 'story', replaces: 0 });
});
