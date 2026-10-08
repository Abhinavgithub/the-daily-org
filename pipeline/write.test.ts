import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { good, item } from './testing';
import { addAlso, printed, readEdition, removeStory, STORIES_DIR, writeBriefs, writeBulletin, writeStories } from './write';

test('a brief is written as its headline and reason, with no summary', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-briefs-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const verdict = { ...good, title: 'A close call worth a glance', interest_score: 5, depth_score: 4, utility_score: 6, tags: [] };
  const brief = { item, curated: { verdict: verdict as never, model: 'm1', inputTokens: 0, outputTokens: 0 } };

  const [first] = writeBriefs('2026-10-05', [brief], dir);
  assert.equal(path.basename(first), '01-test-timing-eurostar-departures.md');
  const text = fs.readFileSync(first, 'utf8');
  assert.match(text, /^---\ntitle: A close call worth a glance\noriginal_title: Timing Eurostar departures\nurl: https:\/\/example\.com\/post\nsource: Test\ndate: 2026-10-05\n/);
  assert.match(text, /why_read: You will learn \*\*bulk\*\* patterns\.\ninterest_score: 5\n/);
  assert.ok(text.endsWith('---\n'), 'nothing after the front matter');
  assert.doesNotMatch(text, /First paragraph|tags:/);

  // A later run on the same day numbers on from what is there.
  const [second] = writeBriefs('2026-10-05', [brief], dir);
  assert.equal(path.basename(second), '02-test-timing-eurostar-departures.md');
});

test('a Bulletin item is written apart from the stories: an alert with its flag and account, a release as one line', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-bulletin-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const curated = { verdict: { ...good, title: 'An outage across many instances', why_read: 'Logins failed for two hours.', summary: 'What happened, in short.' } as never, model: 'm1', inputTokens: 0, outputTokens: 0 };
  const alert = { ...item, alert: { label: 'Incident', facts: 'Resolved · began 16 Sep 2026 · 595 instances', always: true } };

  const [first] = writeBulletin('2026-10-06', 'alert', [{ item: alert, curated }], dir);
  const text = fs.readFileSync(first, 'utf8');
  assert.match(text, /^---\nkind: alert\ntitle: An outage across many instances\n/);
  assert.match(text, /\nline: Logins failed for two hours\.\nflag: Incident\nfacts: Resolved · began 16 Sep 2026 · 595 instances\n/);
  assert.ok(text.endsWith('---\n\nWhat happened, in short.\n'));

  const [second] = writeBulletin('2026-10-06', 'release', [{ item, curated }], dir);
  assert.equal(path.basename(second), '02-test-timing-eurostar-departures.md', 'numbered on from what the day already has');
  const release = fs.readFileSync(second, 'utf8');
  assert.match(release, /^---\nkind: release\n/);
  assert.doesNotMatch(release, /flag:|facts:|What happened/);
  assert.ok(release.endsWith('---\n'));
});

test('a story told twice is printed once, with a line for the other telling', (t) => {
  // A day far from any edition, since stories are written into the paper's own folder.
  const day = '1999-01-01';
  t.after(() => fs.rmSync(path.join(STORIES_DIR, day), { recursive: true, force: true }));
  const curated = { verdict: { ...good, title: 'A new timetable for the branch line', summary: 'First paragraph.\n\nSecond paragraph.' } as never, model: 'm1', inputTokens: 0, outputTokens: 0 };
  const other = { title: 'Branch line timetable, explained', url: 'https://example.com/video', source: 'Test on video' };

  const [first] = writeStories(day, [{ item, curated }]);
  assert.doesNotMatch(fs.readFileSync(first, 'utf8'), /also:/, 'no line where there is no other telling');

  addAlso(first, other);
  addAlso(first, { ...other, url: 'https://example.com/third' });
  const text = fs.readFileSync(first, 'utf8');
  assert.match(text, /\nalso:\n  - title: Branch line timetable, explained\n    url: https:\/\/example\.com\/video\n    source: Test on video\n  - title: Branch line timetable, explained\n    url: https:\/\/example\.com\/third\n/);
  assert.ok(text.startsWith('---\ntitle: A new timetable for the branch line\n'), 'the rest of the story is as it was');
  assert.ok(text.endsWith('---\n\nFirst paragraph.\n\nSecond paragraph.\n'));

  // A better telling takes the first one's place, and carries the line for it.
  const [second] = writeStories(day, [{ item: { ...item, title: 'The better telling' }, curated, also: [other] }]);
  fs.rmSync(first);
  assert.match(fs.readFileSync(second, 'utf8'), /\nalso:\n  - title: Branch line timetable, explained\n/);
  const [third] = writeStories(day, [{ item, curated }]);
  assert.equal(path.basename(third), '03-test-timing-eurostar-departures.md', 'numbered on from the highest, not from how many are left');
});

test('a later run reads what the day already has, so a story is not told again', (t) => {
  const day = '1999-01-02';
  const pub = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-public-'));
  t.after(() => fs.rmSync(path.join(STORIES_DIR, day), { recursive: true, force: true }));
  t.after(() => fs.rmSync(pub, { recursive: true, force: true }));
  assert.deepEqual(readEdition(day), [], 'a day with no edition yet');

  const story = (title: string, interest_score: number) => ({ verdict: { ...good, title, interest_score, summary: 'A paragraph.' } as never, model: 'm1', inputTokens: 0, outputTokens: 0 });
  const other = { title: 'Seen elsewhere', url: 'https://example.com/elsewhere', source: 'Elsewhere' };
  const first = { item, curated: story('A new timetable for the branch line', 6), also: [other] };
  const [one] = writeStories(day, [first]);
  const [two] = writeStories(day, [{ item: { ...item, title: 'Remote panels', url: 'https://example.com/panels' }, curated: story('Signal boxes get a remote panel', 8) }]);
  fs.writeFileSync(path.join(STORIES_DIR, day, '99-not-a-story.md'), 'no front matter here\n');

  const read = readEdition(day);
  assert.deepEqual(read.map((s) => [s.title, s.score]), [['A new timetable for the branch line', 6], ['Signal boxes get a remote panel', 8]], 'in the order written, and only what is a story');
  assert.deepEqual(read[0], printed(one, first), 'a story read back is the story as it was written');
  assert.deepEqual(read[0].told, { title: 'Timing Eurostar departures', url: 'https://example.com/post', source: 'Test' }, "the line it would become carries the article's own title");
  assert.equal(read[1].file, two);

  // Taken out for a better telling, its picture goes with it.
  fs.mkdirSync(path.join(pub, 'figures', day), { recursive: true });
  const picture = path.join(pub, 'figures', day, 'one.webp');
  fs.writeFileSync(picture, 'x');
  fs.writeFileSync(one, fs.readFileSync(one, 'utf8').replace('\n---\n', `\nfigure_image: /figures/${day}/one.webp\n---\n`));
  removeStory(one, pub);
  assert.ok(!fs.existsSync(one) && !fs.existsSync(picture));
  assert.equal(readEdition(day).length, 1);
});
