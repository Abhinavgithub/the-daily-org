import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { dueToday, HELD, holdOver, release } from './hold';
import { readEdition } from './write';

/** A folder to work in, with a way to write a story of a given score into a day. */
function paper(t: { after: (fn: () => void) => void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-hold-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const options = { stories: 2, never: ['releases'], storiesDir: path.join(root, 'stories'), dataDir: root };
  const write = (day: string, number: number, score: number, extra = '') => {
    const dir = path.join(options.storiesDir, day);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `0${number}-test-story-${number}.md`), `---\ntitle: Story ${number}\nurl: https://example.com/${day}/${number}\nsource: Test\ndate: ${day}\nsection: devops\ninterest_score: ${score}\n${extra}---\n\nThe summary.\n`);
  };
  const names = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []);
  return { options, write, day: (day: string) => names(path.join(options.storiesDir, day)), held: () => names(path.join(root, HELD)) };
}

test('what a day has over its number is held, the lowest scored first, and printed on a day with room', (t) => {
  const { options, write, day, held } = paper(t);
  write('2026-10-09', 1, 7);
  write('2026-10-09', 2, 6);
  write('2026-10-09', 3, 8);
  write('2026-10-09', 4, 6);

  const put = holdOver('2026-10-09', options);
  assert.deepEqual(put.map(({ title, from }) => [title, from]), [['Story 4', '2026-10-09'], ['Story 2', '2026-10-09']]);
  assert.deepEqual(day('2026-10-09'), ['01-test-story-1.md', '03-test-story-3.md']);
  assert.deepEqual(held(), ['2026-10-09--02-test-story-2.md', '2026-10-09--04-test-story-4.md']);
  // A held story is not printed on the day it was held, and can be read as an edition is, to be told again.
  assert.deepEqual(dueToday('2026-10-09', options), []);
  assert.deepEqual(readEdition(HELD, options.dataDir).map(({ title }) => title), ['Story 2', 'Story 4']);

  // The next day has one story of its own, and so room for one more.
  write('2026-10-10', 1, 9);
  const out = release('2026-10-10', options);
  assert.deepEqual(out.map(({ title, from, score }) => [title, from, score]), [['Story 2', '2026-10-09', 6]]);
  assert.deepEqual(day('2026-10-10'), ['01-test-story-1.md', '02-test-story-2.md']);
  assert.match(fs.readFileSync(out[0].file, 'utf8'), /\ndate: 2026-10-10\n[\s\S]*\nheld_from: 2026-10-09\n---\n\nThe summary\.\n$/);
  assert.deepEqual(held(), ['2026-10-09--04-test-story-4.md']);
  // A full day is owed nothing, and a story that has had its wait is not put by again.
  assert.deepEqual(dueToday('2026-10-10', options), []);
  write('2026-10-10', 3, 7);
  assert.deepEqual(holdOver('2026-10-10', options).map(({ title }) => title), ['Story 3']);
});

test('a held story fills room the longest held first, and one held three days is printed in full on top of the day', (t) => {
  const { options, write, day, held } = paper(t);
  write('2026-10-09', 1, 9);
  write('2026-10-09', 2, 8);
  write('2026-10-09', 3, 6, 'figure_image: /figures/2026-10-09/a.webp\n');
  write('2026-10-09', 4, 6, '');
  fs.writeFileSync(path.join(options.storiesDir, '2026-10-09', '05-test-story-5.md'), '---\ntitle: Story 5\nurl: https://example.com/5\nsource: Test\ndate: 2026-10-09\nsection: releases\ninterest_score: 6\n---\n\nThe summary.\n');
  // Three are over the number and three are held: not the one with its picture, nor the news of a release.
  assert.deepEqual(holdOver('2026-10-09', options).map(({ title }) => title), ['Story 4', 'Story 2', 'Story 1']);
  assert.deepEqual(day('2026-10-09'), ['03-test-story-3.md', '05-test-story-5.md']);

  // A later story, better than those already waiting, is held the next day.
  write('2026-10-10', 1, 9);
  write('2026-10-10', 2, 9);
  write('2026-10-10', 3, 10);
  assert.deepEqual(holdOver('2026-10-10', options).map(({ title }) => title), ['Story 2']);

  // A full day prints its own stories, and nothing is owed to it until a story has waited three days.
  write('2026-10-11', 1, 7);
  write('2026-10-11', 2, 7);
  assert.deepEqual(dueToday('2026-10-11', options), []);

  // A day with room for one: the three held since the 9th have waited their days and are printed in full whatever
  // the day holds, and the room left goes to the one held since the 10th.
  write('2026-10-12', 1, 7);
  const out = release('2026-10-12', options);
  assert.deepEqual(out.map(({ title, from, late }) => [title, from, late]), [
    ['Story 1', '2026-10-09', true],
    ['Story 2', '2026-10-09', true],
    ['Story 4', '2026-10-09', true],
    ['Story 2', '2026-10-10', false],
  ]);
  assert.deepEqual(held(), []);
  // Those printed for their wait do not count against the day: its own story and the one that filled the room are
  // its number, and nothing is put by for the other three.
  assert.deepEqual(holdOver('2026-10-12', options), []);
  assert.equal(day('2026-10-12').length, 5);
  // A later story of its own is one over the number, and is held.
  write('2026-10-12', 7, 5);
  assert.deepEqual(holdOver('2026-10-12', options).map(({ title }) => title), ['Story 7']);
});
