import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Feedback } from './feedback';
import { buildCases, compare, judgement, mark, sentence, tally, type Logged, type Result } from './replay-lib';

const flag = (kind: Feedback['kind'], url: string, note?: string): Feedback => ({ at: '2026-10-06T00:00:00Z', kind, url, note });
const logged = (url: string, outcome: string): Logged => ({ url, outcome, title: `Title of ${url}`, source: 'Blog' });

test('every flag is judged again, with as many recent unflagged articles of each fate', () => {
  const cases = buildCases(
    [flag('junk', 'https://e.com/advert/', 'An advert'), flag('missed', 'https://e.com/gem')],
    [
      logged('https://e.com/advert', 'published'),
      logged('https://e.com/good-1', 'published'),
      logged('https://e.com/good-2', 'published'),
      logged('https://e.com/bad-1', 'not-relevant'),
      logged('https://e.com/bad-1', 'not-relevant'),
      logged('https://e.com/retry', 'deferred'),
      logged('https://e.com/bad-2', 'dropped'),
      logged('https://e.com/gem', 'below-threshold'),
    ],
    1,
  );
  assert.deepEqual(
    cases.map((c) => [c.url, c.role, c.expect]),
    [
      ['https://e.com/advert', 'flag', 'reject'],
      ['https://e.com/gem', 'flag', 'publish'],
      ['https://e.com/good-1', 'control', 'publish'],
      ['https://e.com/bad-1', 'control', 'reject'],
    ],
  );
  assert.equal(cases[0].title, 'Title of https://e.com/advert', 'a flag takes its title from the run when it has none');
  assert.equal(cases[0].note, 'An advert');
});

test('an article is rejected by the cheap rules, by relevance or by its score, in that order', () => {
  const good = { relevant: true, interest_score: 7 };
  assert.deepEqual(judgement('too short', good, 6), { got: 'reject', why: 'too short' });
  assert.deepEqual(judgement(null, undefined, 6), { got: 'review', why: 'reaches review' });
  assert.equal(judgement(null, { relevant: false, interest_score: 9 }, 6).got, 'reject');
  assert.equal(judgement(null, { relevant: true, interest_score: 5 }, 6).got, 'reject');
  assert.deepEqual(judgement(null, good, 6), { got: 'publish', why: 'scored 7', score: 7 });
  assert.equal(judgement(null, good, 8).got, 'reject');
});

test('an article judged twice with different answers is neither right nor wrong', () => {
  assert.equal(mark('publish', ['publish', 'publish']), 'right');
  assert.equal(mark('reject', ['publish']), 'wrong');
  assert.equal(mark('publish', ['publish', 'reject']), 'unstable');
  assert.equal(mark('publish', ['publish', 'failed']), 'right', 'a failed call is not an answer');
  assert.equal(mark('publish', ['unread']), 'unread');
  assert.equal(mark('reject', ['review']), 'open');
});

const result = (url: string, role: Result['role'], m: Result['mark']): Result => ({ url, title: url, source: '', role, expect: 'publish', mark: m, judgements: [] });

test('flags and controls are counted apart, and a change since the last replay is listed', () => {
  const before = [result('a', 'flag', 'wrong'), result('b', 'flag', 'wrong'), result('c', 'control', 'right'), result('d', 'control', 'right')];
  const after = [result('a', 'flag', 'right'), result('b', 'flag', 'unstable'), result('c', 'control', 'wrong'), result('d', 'control', 'right'), result('e', 'flag', 'right')];
  assert.equal(sentence('Flags', tally(after, 'flag')), 'Flags: 2 of 3 right (1 unstable).');
  assert.equal(sentence('Controls', tally(after, 'control')), 'Controls: 1 of 2 right (1 wrong).');
  assert.deepEqual(compare(before, after), [
    { title: 'a', role: 'flag', from: 'wrong', to: 'right', better: true },
    { title: 'b', role: 'flag', from: 'wrong', to: 'unstable' },
    { title: 'c', role: 'control', from: 'right', to: 'wrong', better: false },
  ]);
});
