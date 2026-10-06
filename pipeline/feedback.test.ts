import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addFeedback, applyRequest, kindFor, normalizeUrl, parseFeedback, removeFeedback, summarize, type Feedback } from './feedback';

const entry = (kind: Feedback['kind'], url: string, source?: string): Feedback => ({ at: '2026-10-06T00:00:00Z', kind, url, source });

test('tracking parameters and fragments do not make a new address', () => {
  assert.equal(normalizeUrl('https://Example.com/a/?utm_source=x&id=2#top'), 'https://example.com/a?id=2');
});

test('the latest verdict on an article replaces the earlier one', () => {
  const first = addFeedback([], entry('missed', 'https://example.com/a'));
  const second = addFeedback(first, entry('junk', 'https://example.com/a/?utm_medium=rss'));
  assert.equal(second.length, 1);
  assert.equal(second[0].kind, 'junk');
});

test('entries survive a round trip through the file format and are counted by source', () => {
  const entries = [entry('junk', 'https://e.com/1', 'a'), entry('missed', 'https://e.com/2', 'a'), entry('junk', 'https://e.com/3')];
  const read = parseFeedback(entries.map((e) => JSON.stringify(e)).join('\n') + '\n');
  assert.deepEqual(read, JSON.parse(JSON.stringify(entries)));
  const s = summarize(read);
  assert.equal(s.junk, 2);
  assert.equal(s.missed, 1);
  assert.deepEqual(s.bySource.a, { junk: 1, missed: 1 });
  assert.deepEqual(s.bySource.unknown, { junk: 1, missed: 0 });
});

test('a verdict can be taken back, under any spelling of the address', () => {
  const entries = [entry('junk', 'https://example.com/a'), entry('missed', 'https://example.com/b')];
  assert.deepEqual(removeFeedback(entries, 'https://example.com/a/#top').map((e) => e.url), ['https://example.com/b']);
});

test('what a run did with an article decides which verdict it can be given', () => {
  assert.equal(kindFor('published'), 'junk');
  for (const outcome of ['below-threshold', 'not-relevant', 'dropped']) assert.equal(kindFor(outcome), 'missed');
  for (const outcome of ['invalid-reply', 'deferred', 'something-new']) assert.equal(kindFor(outcome), undefined);
});

test('a request from the Logs page flags an article, saves its note and takes the flag back', () => {
  const now = new Date('2026-10-06T10:00:00Z');
  const flagged = applyRequest('POST', { kind: 'junk', url: 'https://example.com/a/', title: ' A story ', source: 'Blog', interest: 8, note: '' }, [], now);
  assert.equal(flagged.status, 200);
  assert.deepEqual(flagged.entries, [{ at: '2026-10-06T10:00:00.000Z', kind: 'junk', url: 'https://example.com/a', title: 'A story', source: 'Blog', interest: 8 }]);

  const noted = applyRequest('POST', { kind: 'junk', url: 'https://example.com/a', note: 'An advert' }, flagged.entries, now);
  assert.equal(noted.entries.length, 1);
  assert.equal(noted.entries[0].note, 'An advert');

  assert.deepEqual(applyRequest('DELETE', { url: 'https://example.com/a?utm_source=x' }, noted.entries, now).entries, []);
});

test('a request that makes no sense changes nothing', () => {
  const entries = [entry('junk', 'https://example.com/a')];
  for (const [method, body, status] of [
    ['POST', { kind: 'spam', url: 'https://example.com/b' }, 400],
    ['POST', { kind: 'junk', url: 'not an address' }, 400],
    ['DELETE', null, 400],
    ['GET', {}, 405],
  ] as const) {
    const reply = applyRequest(method, body, entries);
    assert.equal(reply.status, status);
    assert.ok(reply.error);
    assert.equal(reply.entries, entries);
  }
});
