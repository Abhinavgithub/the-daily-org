import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareEntries, compareUpdates, labelOf, noteChanges, removedLately, updateChangeOf, updateLine } from './release-changes';
import type { Enforced, NoteEntry, NotesChange } from './release-edition';

const entry = (topic: string, hash: string, area = 'Flow'): NoteEntry => ({ topic, area, product: 'Flow Builder', title: topic, hash });
const update = (topic: string, when: string, deadline?: string): Enforced => ({ topic, name: `Update ${topic}`, says: 'It changes.', when, ...(deadline ? { deadline } : {}) });

test('entries new to the notes, entries whose text changed, and entries gone, each said once', () => {
  const before = [entry('a', '1'), entry('b', '2'), entry('c', '3'), entry('c', '3', 'Platform')];
  const now = [entry('a', '1'), entry('b', '9'), entry('d', '4'), entry('d', '4', 'Platform')];
  assert.deepEqual(compareEntries(before, now), { added: ['d'], changed: ['b'], gone: ['c'] });
  assert.deepEqual(compareEntries(now, now), { added: [], changed: [], gone: [] });
});

test("a Release Update's day moving, its standing changing, a new one, and one gone", () => {
  const before = [update('tls', 'Enforced with This Release', '1 Dec 2026'), update('mfa', 'Scheduled'), update('old', 'Scheduled', '5 Jan 2027'), update('both', 'Scheduled', '1 Feb 2027')];
  const now = [update('tls', 'Enforced with This Release', '2 Feb 2027'), update('mfa', 'Postponed'), update('new', 'Enforced with This Release', '3 Mar 2027'), update('both', 'Cancelled', '1 Mar 2027')];
  assert.deepEqual(
    compareUpdates(before, now).map(({ topic, kind, was, now: is }) => [topic, kind, was, is]),
    [
      ['tls', 'date', '1 Dec 2026', '2 Feb 2027'],
      ['mfa', 'status', 'Scheduled', 'Postponed'],
      ['new', 'new', undefined, 'Enforced with This Release'],
      ['both', 'date', '1 Feb 2027', '1 Mar 2027'],
      ['both', 'status', 'Scheduled', 'Cancelled'],
      ['old', 'removed', '5 Jan 2027', undefined],
    ],
  );
  assert.deepEqual(compareUpdates(before, before), []);
  assert.equal(compareUpdates([update('x', 'Scheduled')], [update('x', 'Scheduled', '1 May 2027')])[0].was, 'no day named', 'a day named for the first time');
});

test('what a check found: the printed features whose entries left, and nothing at all when nothing changed', () => {
  const features = [
    { topic: 'c', product: 'Flow Builder', name: 'Old feature', says: 'x', score: 8, area: 'Flow' },
    { topic: 'a', product: 'Flow Builder', name: 'Kept', says: 'y', score: 8, area: 'Flow' },
  ];
  const change = noteChanges('2026-11-15T06:00:00Z', [entry('a', '1'), entry('c', '3')], [entry('a', '1'), entry('d', '4')], features, []);
  assert.deepEqual(change, { at: '2026-11-15T06:00:00Z', added: ['d'], changed: [], removed: [{ topic: 'c', name: 'Old feature', area: 'Flow' }], updates: [] });
  assert.equal(noteChanges('2026-11-15T06:00:00Z', [entry('a', '1')], [entry('a', '1')], features, []), undefined);
});

const CHANGES: NotesChange[] = [
  { at: '2026-10-01T06:00:00Z', added: ['old'], changed: [], removed: [{ topic: 'gone-early', name: 'Gone early', area: 'Flow' }], updates: [] },
  { at: '2026-11-08T06:00:00Z', added: ['a'], changed: ['b'], removed: [{ topic: 'gone', name: 'Gone', area: 'Flow' }], updates: [{ topic: 'tls', name: 'TLS', kind: 'date', was: '1 Dec 2026', now: '2 Feb 2027' }] },
  { at: '2026-11-15T06:00:00Z', added: [], changed: ['a'], removed: [], updates: [] },
];

test('a feature is marked by the latest check that found it new or changed, for thirty days', () => {
  const edition = { changes: CHANGES };
  assert.deepEqual(labelOf(edition, 'a', '2026-11-20'), { kind: 'changed', at: '2026-11-15T06:00:00Z' }, 'changed since it was added');
  assert.deepEqual(labelOf(edition, 'b', '2026-11-20'), { kind: 'changed', at: '2026-11-08T06:00:00Z' });
  assert.equal(labelOf(edition, 'old', '2026-11-20'), undefined, 'added more than thirty days ago');
  assert.equal(labelOf(edition, 'b', '2026-12-09'), undefined, 'thirty-one days on');
  assert.equal(labelOf({}, 'a', '2026-11-20'), undefined, 'an edition never checked');
});

test("a Release Update's latest change, and the features that left the notes lately", () => {
  const edition = { changes: CHANGES };
  assert.equal(updateChangeOf(edition, 'tls', '2026-11-20')?.now, '2 Feb 2027');
  assert.equal(updateChangeOf(edition, 'tls', '2026-12-20'), undefined);
  assert.deepEqual(
    removedLately(edition, '2026-11-20').map((feature) => feature.name),
    ['Gone'],
  );
});

test('a change to a Release Update in a line', () => {
  assert.equal(updateLine({ topic: 't', name: 'n', kind: 'date', was: '1 Dec 2026', now: '2 Feb 2027' }), 'its day moved from 1 Dec 2026 to 2 Feb 2027');
  assert.equal(updateLine({ topic: 't', name: 'n', kind: 'status', was: 'Scheduled', now: 'Postponed' }), 'now filed under "Postponed", not "Scheduled"');
  assert.equal(updateLine({ topic: 't', name: 'n', kind: 'new', now: 'Scheduled To Be Enforced Before Spring ’27' }), 'new to the notes, filed under "Scheduled To Be Enforced Before Spring ’27"');
});
