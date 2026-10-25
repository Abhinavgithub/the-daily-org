import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyVote, cleanNote, MAX_REPORTS_A_DAY, MAX_VOTES_A_DAY, NOTE_LENGTH, parseReport, parseVote, readerHash, reasonLine, reportAllowed, splitFeedback, tally, wanting, type ReportRow, type VoteRow } from './verdict';

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

test('a reason goes with No only, and is one of those offered', () => {
  assert.deepEqual(parseVote({ story: STORY, vote: 'no', reason: 'Old news' }), { story: STORY, vote: 'no', reason: 'Old news' });
  assert.ok('error' in parseVote({ story: STORY, vote: 'yes', reason: 'Old news' }));
  assert.ok('error' in parseVote({ story: STORY, vote: 'no', reason: 'Buy my course' }));
  const kept = applyVote([], { story: STORY, vote: 'no', reason: 'Old news' }, 'r1', now).rows;
  assert.equal(kept[0].reason, 'Old news');
  // Saying No again without a reason, as the line does first, leaves no stale reason behind.
  assert.equal(applyVote(kept, { story: STORY, vote: 'no' }, 'r1', now).rows[0].reason, undefined);
});

test('a report names a story and a part; its note loses links and is cut to length', () => {
  const report = parseReport({ story: STORY, part: 'Summary', note: '  The limit is 50, see https://help.salesforce.com/x?y=1 and www.spam.example  ' });
  assert.ok(!('error' in report));
  assert.equal(report.note, 'The limit is 50, see [link] and [link]');
  assert.equal(report.trap, false);
  assert.ok('error' in parseReport({ story: STORY, part: 'Everything' }));
  assert.ok('error' in parseReport({ story: STORY, part: 'Summary', note: 42 }));
  assert.ok('error' in parseReport({ story: STORY, part: 'Summary', email: 'a@b.c' }));
  assert.equal(cleanNote('x'.repeat(900)).length, NOTE_LENGTH);
  assert.equal(cleanNote('a\u0000b\n\n\n\nc'), 'ab\n\nc');
});

test('a report with the hidden field filled is marked, to be answered and dropped', () => {
  const report = parseReport({ story: STORY, part: 'Headline', website: 'http://spam.example' });
  assert.ok(!('error' in report) && report.trap);
});

test('a reader may send three reports a day', () => {
  const row = (i: number): ReportRow => ({ id: String(i), story: STORY, part: 'Summary', note: '', day: '2026-10-25', who: 'r1', at: '' });
  assert.equal(reportAllowed([row(1), row(2)]).status, 200);
  assert.equal(reportAllowed(Array.from({ length: MAX_REPORTS_A_DAY }, (_, i) => row(i))).status, 429);
});

test('the editor sees votes and reports added up by story', () => {
  const vote = (story: string, v: 'yes' | 'no', reason?: 'Old news' | 'Not for my role'): VoteRow => ({ story, day: '2026-10-25', who: Math.random().toString(), vote: v, at: '', ...(reason ? { reason } : {}) });
  const { votes, reports } = splitFeedback([
    { ...vote('a', 'yes') },
    { kind: 'vote', ...vote('b', 'no', 'Old news') },
    { kind: 'vote', ...vote('b', 'no', 'Old news') },
    { kind: 'vote', ...vote('b', 'no', 'Not for my role') },
    { kind: 'report', id: '1', story: 'a', part: 'Summary', note: '', day: '2026-10-25', who: 'x', at: '' },
  ]);
  assert.equal(votes.length, 4);
  assert.equal(reports.length, 1);
  const [b, a] = tally(votes, reports);
  assert.deepEqual([b.story, b.no, a.story, a.yes, a.reports], ['b', 3, 'a', 1, 1]);
  assert.equal(reasonLine(b.reasons), 'Old news ×2, Not for my role');
  assert.ok(wanting(b));
  assert.ok(!wanting(a));
});
