import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyVote, MAX_VOTES_A_DAY, parseVote, readerHash, type VoteRow } from './verdict';

const STORY = '2026-10-25/01-dev-to-salesforce-ide-in-intellij-idea';
const now = new Date('2026-10-25T08:00:00Z');

test('a vote names a story of the paper and says yes, no or null', () => {
  assert.deepEqual(parseVote({ story: STORY, vote: 'yes' }), { story: STORY, vote: 'yes' });
  assert.deepEqual(parseVote({ story: STORY, vote: null }), { story: STORY, vote: null });
  assert.ok('error' in parseVote({ story: STORY, vote: 'maybe' }));
  assert.ok('error' in parseVote({ story: '../../etc/passwd', vote: 'yes' }));
  assert.ok('error' in parseVote({ story: 'https://example.com', vote: 'yes' }));
  assert.ok('error' in parseVote(null));
  assert.ok('error' in parseVote([STORY, 'yes']));
});

test('a request carrying anything else, such as the field only programs fill, is refused', () => {
  assert.ok('error' in parseVote({ story: STORY, vote: 'yes', website: 'http://spam.example' }));
});

test('the reader hash changes with the day and never contains the address', async () => {
  const a = await readerHash('203.0.113.7', 'salt', '2026-10-25');
  const b = await readerHash('203.0.113.7', 'salt', '2026-10-26');
  assert.equal(a, await readerHash('203.0.113.7', 'salt', '2026-10-25'));
  assert.notEqual(a, b);
  assert.match(a, /^[0-9a-f]{32}$/);
  assert.ok(!a.includes('203'));
});

test('a reader has one vote on a story a day: a second replaces the first, and null takes it back', () => {
  const first = applyVote([], { story: STORY, vote: 'yes' }, 'r1', now);
  assert.equal(first.rows.length, 1);
  const changed = applyVote(first.rows, { story: STORY, vote: 'no' }, 'r1', now);
  assert.deepEqual(
    changed.rows.map((row) => row.vote),
    ['no'],
  );
  const other = applyVote(changed.rows, { story: STORY, vote: 'yes' }, 'r2', now);
  assert.equal(other.rows.length, 2);
  assert.deepEqual(applyVote(other.rows, { story: STORY, vote: null }, 'r1', now).rows.map((row) => row.who), ['r2']);
});

test('a reader is stopped after a day of votes, but may still change one already given', () => {
  let rows: VoteRow[] = [];
  for (let i = 0; i < MAX_VOTES_A_DAY; i++) rows = applyVote(rows, { story: `2026-10-25/story-${i}`, vote: 'yes' }, 'r1', now).rows;
  const over = applyVote(rows, { story: STORY, vote: 'yes' }, 'r1', now);
  assert.equal(over.status, 429);
  assert.equal(over.rows, rows);
  assert.equal(applyVote(rows, { story: '2026-10-25/story-0', vote: 'no' }, 'r1', now).status, 200);
  assert.equal(applyVote(rows, { story: STORY, vote: 'yes' }, 'r1', new Date('2026-10-26T08:00:00Z')).status, 200);
});
