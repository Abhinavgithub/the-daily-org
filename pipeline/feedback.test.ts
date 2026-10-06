import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addFeedback, normalizeUrl, parseFeedback, summarize, type Feedback } from './feedback';

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
