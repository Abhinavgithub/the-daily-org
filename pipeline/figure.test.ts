import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAPER } from './testing';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { addFigures, makeFigure as makeFigureFor, socialCard, validateFigure as validateFigureFor } from './figure';
import { LlmClient } from './llm';

// The tests' own paper, not the one this project publishes.
const makeFigure = (llm: LlmClient, story: Parameters<typeof makeFigureFor>[1]) => makeFigureFor(llm, story, PAPER);
const validateFigure = (raw: string, story: Parameters<typeof validateFigureFor>[1]) => validateFigureFor(raw, story, PAPER);

const story = {
  title: 'New signals cut junction delays to 200 milliseconds',
  summary: 'The team achieved P50 performance below 200 milliseconds, down from about 400 milliseconds, and delivered five signal boxes in six months. Line 360 carries the freight.',
};

const ok = (content: string) => new Response(JSON.stringify({ model: 'm1', choices: [{ message: { content } }], usage: {} }));
const client = (replies: string[]) => {
  let i = 0;
  return new LlmClient({ baseUrl: 'https://x', apiKey: 'k', models: ['m1'], minIntervalMs: 0, maxRetries: 0, fetch: (async () => ok(replies[i++])) as typeof fetch, sleep: async () => {} });
};

test('a diagram is tidied and kept when it says only what the story says', () => {
  const figure = validateFigure(
    '```json\n{"kind":"numbers","caption":"Response time **halved**.","numbers":[{"value":"200 ms","label":"P50, down from 400 ms"}]}\n```',
    story,
  );
  assert.deepEqual(figure, { kind: 'numbers', caption: 'Response time halved', numbers: [{ value: '200 ms', label: 'P50, down from 400 ms' }] });
  assert.deepEqual(validateFigure('{"kind":"none"}', story), { kind: 'none' });
  const steps = validateFigure('{"kind":"steps","caption":"How it works","steps":["Build a goods yard","Reopen Line 360"]}', story);
  assert.equal(steps.kind === 'steps' && steps.steps[0], 'Build a Goods Yard', 'the paper\'s names take house style');
});

test('a diagram may not state a number the story does not', () => {
  assert.throws(() => validateFigure('{"kind":"numbers","caption":"Faster","numbers":[{"value":"150 ms","label":"P50 latency"}]}', story), /150, which is not in the story/);
  assert.throws(() => validateFigure('{"kind":"steps","caption":"Three steps","steps":["Add 12 graphs","Query them"]}', story), /12/);
  assert.throws(() => validateFigure('{"kind":"numbers","caption":"Speed","numbers":[{"value":"fast","label":"P50 latency"}]}', story), /no number/);
});

test('a diagram of the wrong shape or with long labels is refused', () => {
  assert.throws(() => validateFigure('{"kind":"steps","caption":"One step","steps":["Only one"]}', story));
  assert.throws(() => validateFigure('{"kind":"chart","caption":"x"}', story));
  assert.throws(() => validateFigure(`{"kind":"parts","caption":"Parts","whole":"Graph","parts":["a part","another","${'x'.repeat(80)}"]}`, story));
  assert.throws(() => validateFigure('no json here', story));
});

test('an unusable diagram gets one corrective call, then is given up', async () => {
  const fixed = await makeFigure(client(['{"kind":"steps","caption":"c","steps":[]}', '{"kind":"steps","caption":"How it works","steps":["Model the data","Query the graph"]}']), story);
  assert.ok('figure' in fixed && fixed.figure.kind === 'steps');
  const llm = client(['nonsense', 'still nonsense']);
  const failed = await makeFigure(llm, story);
  assert.ok('rejected' in failed);
  assert.equal(llm.calls, 2);
  assert.equal(llm.retries['invalid diagram'], 2);
});

test('a diagram may use a number from the article that the summary leaves out', () => {
  const reply = '{"kind":"numbers","caption":"Graphs delivered","numbers":[{"value":"12 graphs","label":"Planned for next year"}]}';
  assert.throws(() => validateFigure(reply, story), /12, which is not in the story/);
  const figure = validateFigure(reply, { ...story, article: 'The team plans 12 graphs for next year.' });
  assert.equal(figure.kind, 'numbers');
  assert.throws(() => validateFigure(reply.replace('12 graphs', '15 graphs'), { ...story, article: 'The team plans 12 graphs for next year.' }), /15/);
});

test('the article text is sent to the model when there is one', async () => {
  const sent: string[] = [];
  const llm = new LlmClient({
    baseUrl: 'https://x',
    apiKey: 'k',
    models: ['m1'],
    minIntervalMs: 0,
    maxRetries: 0,
    fetch: (async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)).messages[1].content);
      return ok('{"kind":"none"}');
    }) as typeof fetch,
    sleep: async () => {},
  });
  await makeFigure(llm, { ...story, article: 'ARTICLE BODY' });
  await makeFigure(llm, story);
  assert.match(sent[0], /Article text:\nARTICLE BODY$/);
  assert.doesNotMatch(sent[1], /Article text/);
});

const steps = { kind: 'steps' as const, caption: 'How a lookup runs', steps: ['Model the data', 'Query the graph'] };

test('a diagram keeps the pictograms it names, and loses them, not itself, when they do not fit', () => {
  const reply = (icons: unknown) => `{"kind":"steps","caption":"How it works","steps":["Model the data","Query the graph"],"icons":${JSON.stringify(icons)}}`;
  assert.deepEqual(validateFigure(reply(['database', 'flow']), story), { ...steps, caption: 'How it works', icons: ['database', 'flow'] }, 'names are not put into house style');
  assert.equal('icons' in validateFigure(reply(['database']), story), false, 'one short');
  assert.equal('icons' in validateFigure(reply(['database', 'unicorn']), story), false, 'not one of ours');
  const compare = validateFigure('{"kind":"compare","caption":"Old and new","left":{"heading":"Old","points":["Slow","Manual"]},"right":{"heading":"New","points":["Fast","Automatic"]},"icons":["clock","bolt"]}', story);
  assert.deepEqual(compare.kind === 'compare' && compare.icons, ['clock', 'bolt']);
});

test('the prompt offers the pictograms by name', async () => {
  const sent: string[] = [];
  const llm = new LlmClient({
    baseUrl: 'https://x',
    apiKey: 'k',
    models: ['m1'],
    minIntervalMs: 0,
    maxRetries: 0,
    fetch: (async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)).messages[0].content);
      return ok('{"kind":"none"}');
    }) as typeof fetch,
    sleep: async () => {},
  });
  await makeFigure(llm, story);
  assert.match(sent[0], /"icons".*code, database, gear/s);
});

test('the social card is a PNG of the shape social sites ask for', async () => {
  const card = await sharp(await socialCard(steps, PAPER)).metadata();
  assert.deepEqual([card.format, card.width, card.height], ['png', 1200, 630]);
});

test('a story gets its diagram drawn from the article, and the top story a social card', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const places = { storiesDir: path.join(root, 'stories'), figuresDir: path.join(root, 'public', 'figures'), paper: PAPER };

  const dir = path.join(places.storiesDir, '2026-10-04');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '01-test-story.md');
  const write = (extra = '') => fs.writeFileSync(file, `---\ntitle: ${story.title}\nurl: https://example.com/post\ninterest_score: 9\n${extra}---\n\n${story.summary}\n`);
  const diagram = '{"kind":"numbers","caption":"Graphs planned","numbers":[{"value":"12 graphs","label":"Planned for next year"}]}';
  const options = { ...places, readArticle: async () => 'The team plans 12 graphs for next year.' };

  write();
  const llm = client([diagram]);
  const counts = await addFigures(llm, '2026-10-04', options);
  assert.deepEqual({ made: counts.made, cards: counts.cards }, { made: 1, cards: 1 });
  assert.match(fs.readFileSync(file, 'utf8'), /figure_image: \/figures\/2026-10-04\/01-test-story\.png/);
  assert.ok(fs.existsSync(path.join(places.figuresDir, '2026-10-04', '01-test-story.png')));
  assert.equal(llm.calls, 1, 'the card costs no call');

  // Run again: nothing more to do.
  assert.deepEqual(await addFigures(client([]), '2026-10-04', options), { made: 0, cards: 0, none: 0, rejected: 0, skipped: 0 });

  // A painted illustration from before is replaced by a card, without asking the model again.
  fs.mkdirSync(path.join(places.figuresDir, '2026-10-04'), { recursive: true });
  const painted = path.join(places.figuresDir, '2026-10-04', 'old.webp');
  fs.writeFileSync(painted, 'x');
  write(`figure:\n  kind: steps\n  caption: How it works\n  steps:\n    - Model the data\n    - Query the graph\nfigure_image: /figures/2026-10-04/old.webp\n`);
  const redraw = client([]);
  assert.equal((await addFigures(redraw, '2026-10-04', options)).cards, 1);
  assert.equal(redraw.calls, 0);
  assert.equal(fs.existsSync(painted), false);
  assert.match(fs.readFileSync(file, 'utf8'), /figure_image: \/figures\/2026-10-04\/01-test-story\.png/);

  // Nothing to draw: no card.
  write();
  assert.equal((await addFigures(client(['{"kind":"none"}']), '2026-10-04', options)).cards, 0);
});

test('every story gets a diagram, best first, and only the top one a social card', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'paper-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const places = { storiesDir: path.join(root, 'stories'), figuresDir: path.join(root, 'public', 'figures'), paper: PAPER };
  const dir = path.join(places.storiesDir, '2026-10-04');
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= 6; i++) fs.writeFileSync(path.join(dir, `0${i}-story.md`), `---\ntitle: Story ${i}\nurl: https://example.com/${i}\ninterest_score: ${10 - i}\n---\n\nA summary.\n`);
  const diagram = '{"kind":"steps","caption":"How it works","steps":["Model the data","Query the graph"]}';
  const counts = await addFigures(client(Array(6).fill(diagram)), '2026-10-04', places);
  assert.deepEqual({ made: counts.made, cards: counts.cards }, { made: 6, cards: 1 });
  // A run at its call cap leaves the least read stories for later.
  for (let i = 1; i <= 6; i++) fs.writeFileSync(path.join(dir, `0${i}-story.md`), `---\ntitle: Story ${i}\nurl: https://example.com/${i}\ninterest_score: ${10 - i}\n---\n\nA summary.\n`);
  const capped = await addFigures(client(Array(6).fill(diagram)), '2026-10-04', { ...places, maxCalls: 4 });
  assert.deepEqual({ made: capped.made, skipped: capped.skipped }, { made: 4, skipped: 2 });
  assert.match(fs.readFileSync(path.join(dir, '01-story.md'), 'utf8'), /kind: steps/);
  assert.doesNotMatch(fs.readFileSync(path.join(dir, '06-story.md'), 'utf8'), /kind: steps/);
  assert.deepEqual(fs.readdirSync(path.join(places.figuresDir, '2026-10-04')), ['01-story.png']);
});
