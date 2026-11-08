import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { foldRepeats, likeness, partOf, sameAs, sameStory, SAME_SHARE, words } from './same-story';
import { readEdition } from './write';

// Real headlines from the archive. Each pair was printed twice, as two stories.
const REPEATS: [{ title: string; original?: string }, { title: string; original?: string }][] = [
  [
    { title: 'Agentforce Coworker adds Teams, mobile and desktop access and a $50 per-user price', original: "Salesforce's Agentforce Coworker Usage Soars 21x in Three Months" },
    { title: 'Agentforce Coworker Adds Teams and Mobile Access at $50 per User per Month', original: 'Salesforce Agentforce Coworker: A $50 AI Teammate That Works Inside Teams' },
  ],
  [{ title: 'Agentforce Memory policy update roughly doubles recall of stated and changing facts' }, { title: 'Updated Agentforce Memory policy roughly doubles recall of changing facts' }],
  [{ title: 'Agent Fabric adds evals, kill switch and hard spending limits for agents' }, { title: 'Agent Fabric adds automated evals, kill switch and spending limits for agents' }],
  [{ title: 'New Collection Filter Criteria Resource simplifies Flow Builder data manipulation' }, { title: 'New Collection Filter Criteria resource simplifies single record lookups in Flow' }],
  [
    { title: 'Quick Pages beta lets users build governed single-page views in Salesforce', original: 'Introducing Quick Pages (Beta): Tailored Views for Every Role' },
    { title: 'Quick Pages lets users build their own read-only views in beta', original: 'Salesforce Announces Quick Pages – Let Users Build Their Own Custom Pages' },
  ],
];

// Real headlines from the archive that are close but are different stories: the closest pairs of the archive.
const DIFFERENT: [string, string][] = [
  ['Finding missing and duplicate records after a migration by matching external keys', 'Finding hidden duplicate accounts after a Salesforce Data migration'],
  ['How Data 360 compiles governed context for artificial intelligence agents at production scale', 'How Data 360 data graphs deliver trusted customer context to Agentforce'],
  ['Deploy Python Code Extensions for complex Data 360 batch transformations', 'Advanced PySpark patterns for batch data transforms in Data 360'],
  ['Key Winter \'27 platform updates for admins and developers', "Salesforce Winter '27 brings Flow testing, bulk screen actions, and higher heap limits"],
  ['Running Apex tests on a local runtime, without an Org round trip', 'Running Apex tests locally lets new developers skip the sandbox wait'],
  ["Spring '27 release updates to Test before enforcement, part two", "Spring '27 release updates that need testing before enforcement, part one"],
];

test("a headline's words: lower case, singular, no filler, a price kept whole", () => {
  assert.deepEqual(words('How Admins add Teams and a $50 per-user price'), ['add', 'team', '$50', 'per', 'user', 'price']);
  assert.deepEqual(words('Access the class'), ['access', 'class'], 'a word ending in "ss" is not a plural');
});

test('the part of a series a headline names', () => {
  assert.equal(partOf('Release updates, part two'), '2');
  assert.equal(partOf('Release updates (Part 2)'), '2');
  assert.equal(partOf('Part III: the end'), '3');
  assert.equal(partOf('A departure from the norm'), undefined);
});

test('every story the archive printed twice is found to be the same story', () => {
  for (const [a, b] of REPEATS) assert.ok(sameStory(a, b), `${a.title} | ${b.title}: ${likeness(a, b).share.toFixed(2)}`);
});

test('the closest different stories of the archive are not', () => {
  for (const [a, b] of DIFFERENT) assert.equal(sameStory({ title: a }, { title: b }), false, `${a} | ${b}: ${likeness({ title: a }, { title: b }).share.toFixed(2)}`);
});

test('two different articles just under the line, sharing five words, are not one story', () => {
  const graphs = { title: 'How Data 360 data graphs deliver trusted customer context to Agentforce', original: 'How AI Agents Get Trusted Customer Context with Data 360 Data Graphs' };
  const layer = { title: 'How Data 360 compiles governed context for artificial intelligence agents at production scale', original: 'How Data 360 Builds Trusted Context: The Enduring Layer for Enterprise AI' };
  const { shared, share } = likeness(graphs, layer);
  assert.ok(shared.length >= 5 && share > 0.5 && share < SAME_SHARE, `${shared.length} words, ${share.toFixed(2)}`);
  assert.equal(sameStory(graphs, layer), false);
});

test('two parts of one series are never one story, however alike, but the same part is', () => {
  const one = { title: 'Spring release updates to test before enforcement, part one' };
  assert.equal(sameStory(one, { title: 'Spring release updates to test before enforcement, part two' }), false);
  assert.equal(sameStory(one, { title: 'Spring release updates to test before enforcement (Part 1)' }), true);
});

test('a few shared words are not enough, however short the headlines', () => {
  const short = { title: 'Apex cursor pagination limits' };
  assert.equal(sameStory(short, { title: 'Apex cursor pagination limits, explained again' }), false, 'four words, all shared');
  assert.equal(likeness(short, { title: 'Apex cursor pagination limits, explained again' }).share, 1);
});

test('the article\'s own title counts as well as the headline', () => {
  const printed = { title: 'Usage of a new assistant grows quickly', original: 'Agentforce Coworker adds Teams, mobile access and a $50 price' };
  assert.equal(sameAs({ title: 'Agentforce Coworker adds Teams, mobile access and a $50 monthly price' }, [{ title: 'Something else' }, printed]), 1);
  assert.equal(sameAs({ title: 'Something different altogether' }, [printed]), undefined);
});

/** A paper in a folder, with a way to write a story into a day. */
function paper(t: { after: (fn: () => void) => void }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-same-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (day: string, number: number, title: string, score: number, extra = '') => {
    const dir = path.join(root, day);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `0${number}-story-${number}.md`);
    fs.writeFileSync(file, `---\ntitle: "${title}"\noriginal_title: "${title}"\nurl: https://example.com/${day}/${number}\nsource: Source ${number}\ndate: ${day}\nsection: devops\ninterest_score: ${score}\n${extra}---\n\nThe summary.\n`);
    return file;
  };
  const day = (d: string) => readEdition(d, root);
  return { root, write, day };
}

const [COWORKER, COWORKER_AGAIN] = REPEATS[0];

test('a story told twice in a day is printed once, the higher scored kept and the other a line under it', (t) => {
  const { root, write, day } = paper(t);
  write('2026-11-08', 1, 'Checking dependent picklists before a load', 7);
  write('2026-11-08', 7, COWORKER.title, 6);
  write('2026-11-08', 9, COWORKER_AGAIN.title, 8);

  const folded = foldRepeats('2026-11-08', root);
  assert.deepEqual(folded.map((f) => [f.title, f.into.title, f.into.day]), [[COWORKER.title, COWORKER_AGAIN.title, '2026-11-08']]);
  const left = day('2026-11-08');
  assert.deepEqual(left.map((s) => s.title), ['Checking dependent picklists before a load', COWORKER_AGAIN.title]);
  assert.deepEqual(left[1].also, [{ title: COWORKER.title, url: 'https://example.com/2026-11-08/7', source: 'Source 7' }]);
});

test('of two that score alike, the first written is kept', (t) => {
  const { root, write, day } = paper(t);
  write('2026-11-08', 7, COWORKER.title, 6);
  write('2026-11-08', 9, COWORKER_AGAIN.title, 6);
  foldRepeats('2026-11-08', root);
  assert.deepEqual(day('2026-11-08').map((s) => s.title), [COWORKER.title]);
});

test('a story told this week already becomes a line under the earlier telling, with the lines it had', (t) => {
  const { root, write, day } = paper(t);
  const [memory, memoryAgain] = REPEATS[1];
  write('2026-11-04', 1, memory.title, 7);
  write('2026-11-08', 3, memoryAgain.title, 9, 'also:\n  - title: A third telling\n    url: https://example.com/third\n    source: Third\n');
  // Too long ago to count as this week.
  write('2026-10-30', 1, COWORKER.title, 7);
  write('2026-11-08', 4, COWORKER_AGAIN.title, 6);

  const folded = foldRepeats('2026-11-08', root);
  assert.deepEqual(folded.map((f) => [f.title, f.into.day]), [[memoryAgain.title, '2026-11-04']]);
  assert.deepEqual(day('2026-11-08').map((s) => s.title), [COWORKER_AGAIN.title], 'eight days back is not looked at');
  assert.deepEqual(
    day('2026-11-04')[0].also.map((line) => line.title),
    [memoryAgain.title, 'A third telling'],
  );
});

test('a day with no repeats is left as it was', (t) => {
  const { root, write, day } = paper(t);
  write('2026-11-07', 1, DIFFERENT[0][0], 7);
  write('2026-11-08', 1, DIFFERENT[0][1], 7);
  write('2026-11-08', 2, DIFFERENT[5][0], 7);
  write('2026-11-08', 3, DIFFERENT[5][1], 7);
  assert.deepEqual(foldRepeats('2026-11-08', root), []);
  assert.equal(day('2026-11-08').length, 3);
  assert.deepEqual(foldRepeats('2026-11-08', path.join(root, 'none')), [], 'no paper at all');
});

test("a folded story's picture goes over with its diagram to a telling that has none, and is not deleted", (t) => {
  const { root, write, day } = paper(t);
  const [first, second] = REPEATS[3];
  const picture = path.join(root, 'public', 'figures', 'p.webp');
  fs.mkdirSync(path.dirname(picture), { recursive: true });
  fs.writeFileSync(picture, 'image');
  write('2026-10-17', 2, first.title, 7);
  const later = write('2026-10-18', 1, second.title, 7, 'figure:\n  kind: compare\n  caption: The two side by side\nfigure_image: /figures/p.webp\n');
  foldRepeats('2026-10-18', root, undefined, path.join(root, 'public'));
  assert.equal(fs.existsSync(later), false);
  assert.ok(fs.existsSync(picture), 'the picture is kept');
  const kept = fs.readFileSync(path.join(root, '2026-10-17', '02-story-2.md'), 'utf8');
  assert.match(kept, /^figure_image: \/figures\/p\.webp$/m);
  assert.match(kept, /caption: The two side by side/);
  assert.equal(day('2026-10-17')[0].also.length, 1);
});

test("a folded story's picture is deleted only from the folder it is given", (t) => {
  const { root, write } = paper(t);
  const [first, second] = REPEATS[3];
  const picture = path.join(root, 'public', 'figures', 'mine.webp');
  fs.mkdirSync(path.dirname(picture), { recursive: true });
  fs.writeFileSync(picture, 'image');
  write('2026-10-17', 2, first.title, 7, 'figure_image: /figures/theirs.webp\n');
  write('2026-10-18', 1, second.title, 7, 'figure_image: /figures/mine.webp\n');
  foldRepeats('2026-10-18', root, undefined, path.join(root, 'public'));
  assert.equal(fs.existsSync(picture), false, 'the kept telling has a picture of its own, so this one goes');
});
