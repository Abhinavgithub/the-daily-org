import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PAPER } from './testing';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { addFigures, CutOff, fitPicture, illustrationPrompt as illustrationPromptFor, makeFigure as makeFigureFor, makeIllustration as makeIllustrationFor, validateFigure as validateFigureFor } from './figure';
import { LlmClient, LlmError } from './llm';

// The tests' own paper, not the one this project publishes.
const makeIllustration = (llm: LlmClient, figure: Parameters<typeof makeIllustrationFor>[1]) => makeIllustrationFor(llm, figure, PAPER);
const illustrationPrompt = (figure: Parameters<typeof illustrationPromptFor>[0], span?: 1 | 2 | 3) => illustrationPromptFor(figure, PAPER, span);
const makeFigure = (llm: LlmClient, story: Parameters<typeof makeFigureFor>[1]) => makeFigureFor(llm, story, PAPER);
const validateFigure = (raw: string, story: Parameters<typeof validateFigureFor>[1]) => validateFigureFor(raw, story, PAPER);

const story = {
  title: 'Data graphs cut Agentforce lookups to 200 milliseconds',
  summary: 'The team achieved P50 performance below 200 milliseconds, down from about 400 milliseconds, and delivered five data graphs in six months. Data 360 holds the identity graph.',
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
  const steps = validateFigure('{"kind":"steps","caption":"How it works","steps":["Build a custom object","Query Data 360"]}', story);
  assert.equal(steps.kind === 'steps' && steps.steps[0], 'Build a Custom Object', 'feature names take house style');
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

test('the picture is asked to show the checked labels and no other words', () => {
  const prompt = illustrationPrompt(steps);
  assert.match(prompt, /What it shows: How a lookup runs/);
  assert.match(prompt, /- Model the data\n- Query the graph\n/);
  assert.doesNotMatch(prompt, /200 milliseconds/);
});

/** A picture on paper: a dark block of the given size placed at the given point. */
const drawing = (width: number, height: number, block: { left: number; top: number; width: number; height: number }) =>
  sharp({ create: { width, height, channels: 3, background: '#f1ebdd' } })
    .composite([{ input: { create: { width: block.width, height: block.height, channels: 3, background: '#1c1a16' } }, left: block.left, top: block.top }])
    .png()
    .toBuffer();
/** A square picture with wide blank bands above and below its drawing. */
const banded = () => drawing(200, 200, { left: 20, top: 80, width: 160, height: 40 });
/** A picture whose drawing runs off its left edge. */
const cut = () => drawing(200, 200, { left: 0, top: 80, width: 160, height: 40 });

/** A client whose chat replies and image replies are given in order. */
async function painter(options: { chat?: string[]; image: 'png' | 'none' | 'broken' | 'cut' | 'cut-then-png'; imageModel?: string | null }) {
  const png = (await banded()).toString('base64');
  const off = (await cut()).toString('base64');
  let pictures = 0;
  const shapes: unknown[] = [];
  const chat = [...(options.chat ?? [])];
  const asked: string[] = [];
  const llm = new LlmClient({
    baseUrl: 'https://x',
    apiKey: 'k',
    models: ['m1'],
    imageModel: options.imageModel === null ? undefined : (options.imageModel ?? 'painter'),
    minIntervalMs: 0,
    maxRetries: 0,
    fetch: (async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      asked.push(body.model);
      if (!body.modalities) return ok(chat.shift() ?? '{"kind":"none"}');
      shapes.push(body.image_config?.aspect_ratio);
      const good = options.image === 'png' || (options.image === 'cut-then-png' && pictures > 0);
      pictures++;
      const url = good ? `data:image/png;base64,${png}` : options.image === 'broken' ? 'data:image/png;base64,AAAA' : options.image === 'none' ? undefined : `data:image/png;base64,${off}`;
      return new Response(JSON.stringify({ model: 'painter', choices: [{ message: { content: '', images: url ? [{ image_url: { url } }] : [] } }], usage: { prompt_tokens: 5, completion_tokens: 7 } }));
    }) as typeof fetch,
    sleep: async () => {},
  });
  return { llm, asked, shapes };
}

test('an illustration comes back as a WebP file, and a reply without a usable picture is an error', async () => {
  const { llm } = await painter({ image: 'png' });
  const picture = await makeIllustration(llm, steps);
  assert.equal((await sharp(picture).metadata()).format, 'webp');
  assert.deepEqual(llm.usage.painter, { input: 5, output: 7 });
  await assert.rejects(makeIllustration((await painter({ image: 'none' })).llm, steps), LlmError);
  await assert.rejects(makeIllustration((await painter({ image: 'broken' })).llm, steps), LlmError);
  await assert.rejects(makeIllustration((await painter({ image: 'png', imageModel: null })).llm, steps), /LLM_IMAGE_MODEL/);
});

test('a must-read story gets its diagram drawn from the article, then illustrated', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'herald-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const places = { storiesDir: path.join(root, 'stories'), figuresDir: path.join(root, 'public', 'figures'), paper: PAPER };

  const dir = path.join(places.storiesDir, '2026-10-04');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '01-test-story.md');
  const write = () => fs.writeFileSync(file, `---\ntitle: ${story.title}\nurl: https://example.com/post\ninterest_score: 9\n---\n\n${story.summary}\n`);
  const diagram = '{"kind":"numbers","caption":"Graphs planned","numbers":[{"value":"12 graphs","label":"Planned for next year"}]}';
  const options = { ...places, readArticle: async () => 'The team plans 12 graphs for next year.' };

  write();
  const made = await painter({ chat: [diagram], image: 'png' });
  const counts = await addFigures(made.llm, '2026-10-04', options);
  assert.deepEqual({ made: counts.made, illustrated: counts.illustrated }, { made: 1, illustrated: 1 });
  assert.match(fs.readFileSync(file, 'utf8'), /figure_image: \/figures\/2026-10-04\/01-test-story\.webp/);
  assert.ok(fs.existsSync(path.join(root, 'public', 'figures', '2026-10-04', '01-test-story.webp')));
  assert.deepEqual(made.asked, ['m1', 'painter']);

  // The image model fails: the drawn diagram stays, and the failure is recorded.
  write();
  const records: unknown[] = [];
  const failed = await painter({ chat: [diagram], image: 'none' });
  const kept = await addFigures(failed.llm, '2026-10-04', { ...options, record: (entry) => records.push(entry) });
  assert.deepEqual({ made: kept.made, illustrated: kept.illustrated }, { made: 1, illustrated: 0 });
  assert.match(fs.readFileSync(file, 'utf8'), /kind: numbers/);
  assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /figure_image/);
  assert.deepEqual((records[0] as { image: string }).image, 'failed');

  // A story that has its diagram and no picture gets only the picture.
  const later = await painter({ image: 'png' });
  const filled = await addFigures(later.llm, '2026-10-04', options);
  assert.deepEqual({ made: filled.made, illustrated: filled.illustrated }, { made: 0, illustrated: 1 });
  assert.deepEqual(later.asked, ['painter']);

  // Nothing to draw, or no image model: no picture is asked for.
  write();
  const none = await painter({ chat: ['{"kind":"none"}'], image: 'png' });
  assert.equal((await addFigures(none.llm, '2026-10-04', options)).illustrated, 0);
  assert.deepEqual(none.asked, ['m1']);
  write();
  const plain = await painter({ chat: [diagram], image: 'png', imageModel: null });
  assert.equal((await addFigures(plain.llm, '2026-10-04', options)).illustrated, 0);
  assert.deepEqual(plain.asked, ['m1']);
});

test('a rate-limited picture is asked for again', async () => {
  const png = (await banded()).toString('base64');
  let n = 0;
  const llm = new LlmClient({
    baseUrl: 'https://x',
    apiKey: 'k',
    models: ['m1'],
    imageModel: 'painter',
    minIntervalMs: 0,
    maxRetries: 1,
    fetch: (async () =>
      n++ === 0
        ? new Response('slow down', { status: 429 })
        : new Response(JSON.stringify({ choices: [{ message: { images: [{ image_url: { url: `data:image/png;base64,${png}` } }] } }] }))) as typeof fetch,
    sleep: async () => {},
  });
  const picture = await llm.image('draw');
  assert.equal(picture.mime, 'image/png');
  assert.equal(llm.calls, 2);
  assert.equal(llm.retries['HTTP 429'], 1);
});

test('only the top story of an edition is illustrated', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'herald-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const places = { storiesDir: path.join(root, 'stories'), figuresDir: path.join(root, 'public', 'figures'), paper: PAPER };
  const dir = path.join(places.storiesDir, '2026-10-04');
  fs.mkdirSync(dir, { recursive: true });
  // Six stories make two must-reads.
  for (let i = 1; i <= 6; i++) fs.writeFileSync(path.join(dir, `0${i}-story.md`), `---\ntitle: Story ${i}\nurl: https://example.com/${i}\ninterest_score: ${10 - i}\n---\n\nA summary.\n`);
  const diagram = '{"kind":"steps","caption":"How it works","steps":["Model the data","Query the graph"]}';
  const { llm, asked } = await painter({ chat: [diagram, diagram], image: 'png' });
  const counts = await addFigures(llm, '2026-10-04', places);
  assert.deepEqual({ made: counts.made, illustrated: counts.illustrated }, { made: 2, illustrated: 1 });
  assert.deepEqual(asked, ['m1', 'painter', 'm1']);
  assert.deepEqual(fs.readdirSync(path.join(places.figuresDir, '2026-10-04')), ['01-story.webp']);
});

test('the picture is asked for in the shape of the box it will sit in', async () => {
  assert.match(illustrationPrompt(steps, 1), /Format: 4:3,/);
  assert.match(illustrationPrompt(steps, 1), /about 5% of the picture's height/);
  assert.match(illustrationPrompt(steps, 2), /Format: 16:9,/);
  assert.match(illustrationPrompt(steps, 2), /about 4% of the picture's height/);
  assert.match(illustrationPrompt(steps, 3), /Format: 16:9,/);
  assert.doesNotMatch(illustrationPrompt(steps), /capitals,|wide empty margin/);

  const single = await painter({ image: 'png' });
  await makeIllustrationFor(single.llm, steps, PAPER, 1);
  const wide = await painter({ image: 'png' });
  await makeIllustrationFor(wide.llm, steps, PAPER, 2);
  assert.deepEqual([single.shapes, wide.shapes], [['4:3'], ['16:9']]);
});

test('blank paper around a drawing is cut away, leaving a thin even margin', async () => {
  const fitted = await sharp(await fitPicture(await banded())).metadata();
  // A 160 by 40 drawing with a margin of 3% of its width (5 px) on every side.
  assert.deepEqual([fitted.width, fitted.height], [170, 50]);
  await assert.rejects(fitPicture(await sharp({ create: { width: 60, height: 40, channels: 3, background: '#f1ebdd' } }).png().toBuffer()), /blank/);
});

test('a drawing that runs off the edge is asked for once more, then given up', async () => {
  await assert.rejects(fitPicture(await cut()), (err) => err instanceof CutOff && /ran off the left/.test(err.message));

  const second = await painter({ image: 'cut-then-png' });
  const picture = await makeIllustration(second.llm, steps);
  assert.equal((await sharp(picture).metadata()).width, 170);
  assert.equal(second.llm.calls, 2);
  assert.equal(second.llm.retries['picture cut off'], 1);

  const never = await painter({ image: 'cut' });
  await assert.rejects(makeIllustration(never.llm, steps), CutOff);
  assert.equal(never.llm.calls, 2, 'no third picture is paid for');
});

test('a frame ruled round the whole picture is cut away with the paper inside it', async () => {
  // A 400 by 300 picture: a thin frame near its edge, and a 200 by 60 drawing in the middle.
  const paper = { create: { width: 400, height: 300, channels: 3 as const, background: '#f1ebdd' } };
  const ink = (width: number, height: number) => ({ create: { width, height, channels: 3 as const, background: '#1c1a16' } });
  const framed = await sharp(paper)
    .composite([
      { input: ink(360, 2), left: 20, top: 20 },
      { input: ink(360, 2), left: 20, top: 278 },
      { input: ink(2, 260), left: 20, top: 20 },
      { input: ink(2, 260), left: 378, top: 20 },
      { input: ink(200, 60), left: 100, top: 120 },
    ])
    .png()
    .toBuffer();
  const fitted = await sharp(await fitPicture(framed)).metadata();
  assert.deepEqual([fitted.width, fitted.height], [212, 72], 'the drawing with a 3% margin, not the frame');

  // A drawing with no frame is not cut into: its own edge is kept whole.
  const plain = await sharp(await fitPicture(await banded())).metadata();
  assert.deepEqual([plain.width, plain.height], [170, 50]);
});

test('the words in the labels are spelled out letter by letter for the image model', () => {
  const prompt = illustrationPrompt({ kind: 'steps', caption: 'Setup', steps: ['Insert language, telephony, and modality blocks', 'Rewrite it'] });
  assert.match(prompt, /letter by letter: Insert \(I-n-s-e-r-t\), language \(l-a-n-g-u-a-g-e\), telephony \(t-e-l-e-p-h-o-n-y\), modality \(m-o-d-a-l-i-t-y\), blocks \(b-l-o-c-k-s\), Rewrite \(R-e-w-r-i-t-e\)\./);
  assert.doesNotMatch(illustrationPrompt({ kind: 'steps', caption: 'Setup', steps: ['Do it', 'Check it'] }), /letter by letter/);
});
