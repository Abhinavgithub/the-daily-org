import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import type { Edition, Enforced, NoteEntry } from '../src/lib/release-edition';
import { carryOver, fingerprint, keepReadings } from './release-edition';
import { updateNotices } from './release-notices';
import { writeNotices } from './write';

// Checking a release edition against the notes again: what stands, what is read again, and what readers are told.

const note = (topic: string, hash: string, area = 'Flow'): NoteEntry => ({ topic, area, product: 'Flow Builder', title: topic, hash });
const feature = (topic: string, name: string) => ({ topic, product: 'Flow Builder', name, says: 'It does a thing.', score: 8 });
const edition = (over: Partial<Edition> = {}): Edition => ({
  release: { name: "Winter '27", number: '264.0.0', slug: 'winter-27' },
  builtAt: '2026-11-01T06:00:00Z',
  model: 'm',
  link: 'https://help.example/s/articleView?id={topic}',
  areas: [
    { name: 'Flow', topic: 'flow', features: [feature('a', 'A1'), feature('a', 'A2'), feature('b', 'B')] },
    { name: 'Platform', topic: 'platform', features: [feature('a', 'A in Platform')] },
  ],
  enforced: [],
  ...over,
});

test("an entry's fingerprint changes with its words and only with them", () => {
  assert.equal(fingerprint({ title: 'T', text: 'Some words.' }), fingerprint({ title: 'T', text: 'Some words.' }));
  assert.notEqual(fingerprint({ title: 'T', text: 'Some words.' }), fingerprint({ title: 'T', text: 'Other words.' }));
  assert.match(fingerprint({ title: 'T', text: 'x' }), /^[0-9a-f]{12}$/);
});

test('an unchanged entry keeps the features it gave, in its own area; a new or changed one is read again', () => {
  const previous = edition({ entries: [note('a', '1'), note('b', '2'), note('z', '5'), note('a', '1', 'Platform')] });
  const now = [note('a', '1'), note('b', '9'), note('c', '3'), note('z', '5'), note('a', '1', 'Platform')];
  const { kept, toRead } = carryOver(previous, now.slice(0, 4));
  assert.deepEqual(
    kept.get('a')?.map((f) => f.name),
    ['A1', 'A2'],
    'only the Flow area’s features for a Flow entry',
  );
  assert.deepEqual(kept.get('z'), [], 'an unchanged entry that gave nothing gives nothing, and costs no call');
  assert.deepEqual([...toRead], ['b', 'c']);
  assert.deepEqual(
    carryOver(previous, [now[4]]).kept.get('a')?.map((f) => f.name),
    ['A in Platform'],
  );
});

test('before the notes were ever kept, an entry that gave features stands, and any other is read', () => {
  const { kept, toRead } = carryOver(edition(), [note('a', '1'), note('b', '2'), note('c', '3')]);
  assert.deepEqual([...kept.keys()], ['a', 'b']);
  assert.deepEqual([...toRead], ['c']);
  assert.deepEqual([...carryOver(undefined, [note('a', '1')]).toRead], ['a'], 'with nothing built before, everything is read');
});

test("the editor's reading of a Release Update stands while the notes say the same of it", () => {
  const read: Enforced = { topic: 't', name: 'TLS', says: 'It changes.', when: 'Scheduled', deadline: '1 Dec 2026', roles: ['admin'], action: 'Check your integrations.', phrases: ['TLS 1.3'] };
  const { kept, toRead } = keepReadings([read], [
    { topic: 't', name: 'TLS', says: 'It changes.', when: 'Scheduled', deadline: '1 Dec 2026' },
    { topic: 'u', name: 'New', says: 'New.', when: 'Scheduled' },
  ]);
  assert.equal(kept[0].action, 'Check your integrations.');
  assert.deepEqual(kept[0].roles, ['admin']);
  assert.deepEqual(toRead, [1]);
  assert.deepEqual(keepReadings([read], [{ ...read, action: undefined, roles: undefined, phrases: undefined, deadline: '2 Feb 2027' }]).toRead, [0], 'a moved day is read again');
});

test('a changed Release Update is told in the Bulletin, with the notes and its card linked; one gone is not', () => {
  const tls: Enforced = { topic: 'release-notes.rn_tls.htm', name: 'Enforce TLS 1.3', says: 'Connections must use TLS 1.3.', when: 'Enforced with This Release', deadline: '2 Feb 2027', action: 'Check your integrations.' };
  const notices = updateNotices(edition({ enforced: [tls], checkedAt: '2026-11-15T06:00:00Z' }), [
    { topic: tls.topic, name: tls.name, kind: 'date', was: '1 Dec 2026', now: '2 Feb 2027' },
    { topic: 'gone', name: 'Gone', kind: 'removed', was: 'Scheduled' },
  ]);
  assert.equal(notices.length, 1);
  const [notice] = notices;
  assert.equal(notice.title, 'Enforce TLS 1.3: now 2 Feb 2027, was 1 Dec 2026');
  assert.equal(notice.flag, 'Deadline moved');
  assert.equal(notice.url, 'https://help.example/s/articleView?id=release-notes.rn_tls.htm');
  assert.equal(notice.line, "The Winter '27 release notes moved its day from 1 Dec 2026 to 2 Feb 2027.");
  const [added] = updateNotices(edition({ enforced: [tls] }), [{ topic: tls.topic, name: tls.name, kind: 'new', now: 'Enforced with This Release' }]);
  assert.equal(added.line, 'New to the Winter \'27 release notes, filed under "Enforced with This Release", from 2 Feb 2027.');
  assert.equal(added.title, 'Enforce TLS 1.3', 'its flag says it is new');
  assert.equal(notice.facts, 'As the release notes stood on 15 November 2026.');
  assert.match(notice.body, /\*\*What to do:\*\* Check your integrations\.[\s\S]*\(\/deadlines\/#deadline-release-notes-rn-tls-htm\)$/);
});

test('a notice is written once a day, however often the check runs', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-notices-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const notice = { title: 'Enforce TLS 1.3: now 2 Feb 2027, was 1 Dec 2026', url: 'https://help.example/x', source: "Winter '27 release notes", flag: 'Deadline moved', line: 'It moved.', body: 'Body.' };
  const [file] = writeNotices('2026-11-15', [notice], dir);
  assert.equal(path.basename(file), '01-notice-enforce-tls-1-3-now-2-feb-2027-was-1-dec-2026.md');
  const text = fs.readFileSync(file, 'utf8');
  assert.match(text, /^---\nkind: alert\n/);
  assert.match(text, /flag: Deadline moved\n/);
  assert.match(text, /date: 2026-11-15\n/);
  assert.deepEqual(writeNotices('2026-11-15', [notice], dir), [], 'the same notice again that day');
  assert.equal(writeNotices('2026-11-15', [{ ...notice, title: 'Another' }], dir).length, 1);
});

test('two notices whose headlines begin alike are both written', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-notices-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  // As on 8 Nov: the file names of these two are cut to the same words.
  const base = { url: 'https://help.example/x', source: "Winter '27 release notes", flag: 'New release update', line: 'New.', body: 'Body.' };
  const written = writeNotices('2026-11-08', [
    { ...base, title: 'New release update: Finish preparing for MFA enforcement for all employee users' },
    { ...base, title: 'New release update: Finish preparing for MFA enforcement for previously Exempt Users' },
  ], dir);
  assert.equal(written.length, 2);
  assert.equal(new Set(written).size, 2);
  assert.equal(writeNotices('2026-11-08', [{ ...base, title: 'New release update: Finish preparing for MFA enforcement for previously Exempt Users' }], dir).length, 0);
});
