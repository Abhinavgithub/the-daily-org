import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanHeadline as cleanHeadlineFor, curate as curateFor, editorPrompt, InvalidVerdict, parseJsonLoosely, plainText, prefilter as prefilterFor, proofread as proofreadFor, unfaithful, verdictSchema } from './curate';
import { definePaper, problemsWith } from '../src/paper';
import { canonicalUrl } from './dedupe';
import { client, good, item, ok, PAPER } from './testing';

// The tests' own paper, not the one this project publishes.
const cleanHeadline = (raw: string, fallback: string, context = '') => cleanHeadlineFor(raw, fallback, context, PAPER);
const proofread = (llm: Parameters<typeof proofreadFor>[0], copy: Parameters<typeof proofreadFor>[1], options: { newHeadline?: boolean } = {}) => proofreadFor(llm, copy, { ...options, paper: PAPER });
const prefilter = (...args: [Parameters<typeof prefilterFor>[0], string]) => prefilterFor(...args, PAPER);
const curate = (...args: [Parameters<typeof curateFor>[0], Parameters<typeof curateFor>[1], string]) => curateFor(...args, PAPER);

test('malformed JSON gets one corrective retry, then succeeds', async () => {
  const { llm, calls } = client([() => ok('Sure! Here you go: {not json'), () => ok('```json\n' + JSON.stringify(good) + '\n```')]);
  const { verdict } = await curate(llm, item, 'text');
  assert.equal(calls.length, 2);
  assert.deepEqual(llm.retries, { 'invalid reply': 1 });
  assert.equal(verdict.depth_score, 7, 'numeric strings are coerced');
  assert.equal(verdict.utility_score, 10, 'scores are clamped to 1-10');
  assert.deepEqual(verdict.tags, ['eurostar', 'bulk-patterns']);
});

test('model output is reduced to plain prose', async () => {
  const { llm } = client([() => ok(JSON.stringify(good))]);
  const { verdict } = await curate(llm, item, 'text');
  assert.equal(verdict.why_read, 'You will learn bulk patterns.');
  assert.equal(verdict.summary, 'First paragraph with a link.\n\nalert(1)Second paragraph.');
});

test('two unusable replies skip the item', async () => {
  const { llm } = client([() => ok('nope'), () => ok(JSON.stringify({ ...good, section: 'gossip' }))]);
  await assert.rejects(curate(llm, item, 'text'), InvalidVerdict);
});

test('the model writes the headline, with the article title as the fallback', async () => {
  const withTitle = { ...good, title: '"Eurostar departures need a check per platform."' };
  let run = client([() => ok(JSON.stringify(withTitle))]);
  assert.equal((await curate(run.llm, item, 'text')).verdict.title, 'Eurostar departures need a check per platform');

  run = client([() => ok(JSON.stringify(good))]);
  assert.equal((await curate(run.llm, item, 'text')).verdict.title, item.title, 'no headline in the reply');

  assert.equal(cleanHeadline('x'.repeat(200), 'Fallback'), 'Fallback', 'over-long');
  assert.equal(cleanHeadline('**Using goods yards** in plans', 'Fallback'), 'Using Goods Yards in plans');
});

test('proof-reading corrects text but cannot rewrite it', async () => {
  const copy = {
    title: 'Bulk patterns for eurostar departures',
    why_read: 'You will learns how to plan a departure.',
    summary: 'First paragraph about goods yards.\n\nSecond paragraph.',
  };
  const reply = (fields: object) => () => ok(JSON.stringify({ ...copy, ...fields }));

  let run = client([reply({ why_read: 'You will learn how to plan a departure.' })]);
  let result = await proofread(run.llm, copy);
  assert.equal(result.outcome, 'corrected');
  assert.equal(result.copy.why_read, 'You will learn how to plan a departure.');
  assert.equal(result.copy.title, 'Bulk patterns for Eurostar departures', 'glossary applied after the model');
  assert.equal(result.copy.summary, 'First paragraph about Goods Yards.\n\nSecond paragraph.');

  // A bad field is thrown away on its own; a good one in the same reply is still used.
  run = client([reply({ summary: 'Short.', why_read: 'You will learn how to plan a departure.' })]);
  result = await proofread(run.llm, copy);
  assert.equal(result.outcome, 'corrected');
  assert.equal(result.copy.summary, 'First paragraph about Goods Yards.\n\nSecond paragraph.', 'summary reverted');
  assert.equal(result.copy.why_read, 'You will learn how to plan a departure.', 'reason kept');
  assert.equal(result.reverted.length, 1);

  // Merged paragraphs, or a reply that is not JSON, leave the story as written.
  run = client([reply({ summary: 'First paragraph about goods yards. Second paragraph.' })]);
  result = await proofread(run.llm, copy);
  assert.equal(result.copy.summary, 'First paragraph about Goods Yards.\n\nSecond paragraph.');
  run = client([() => ok('I fixed it for you!')]);
  result = await proofread(run.llm, copy);
  assert.equal(result.outcome, 'kept');
  assert.equal(result.usable, false);

  // The provider being down publishes the story as written.
  const limited = () => new Response('', { status: 429 });
  run = client([limited, limited, limited]);
  result = await proofread(run.llm, copy);
  assert.equal(result.outcome, 'skipped');
  assert.equal(result.copy.title, 'Bulk patterns for Eurostar departures');

  // A new headline is allowed to differ from the old title when asked for.
  run = client([reply({ title: 'Check lists keep Eurostar departures on time as passenger numbers grow' })]);
  assert.equal((await proofread(run.llm, copy)).copy.title, 'Bulk patterns for Eurostar departures', 'headline rewrite not requested');
  run = client([reply({ title: 'Check lists keep Eurostar departures on time as passenger numbers grow' })]);
  result = await proofread(run.llm, copy, { newHeadline: true });
  assert.equal(result.copy.title, 'Check lists keep Eurostar departures on time as passenger numbers grow');
});

test('proof-reading may not change names, numbers or more than a few words', () => {
  const text = 'Opening requires Line 360 first, and then Coworker reads 270+ signals, a change from Winter \'27.';
  assert.equal(unfaithful(text, text), null);
  assert.equal(unfaithful('You will learns it and it work.', 'You will learn it and it works.'), null);
  assert.equal(unfaithful('in a goods yard, because it works', 'in a Goods Yard because it works'), null);
  assert.match(unfaithful(text, text.replace('Line 360', 'Line North'))!, /360/);
  assert.match(unfaithful(text, text.replace('270+', '300+'))!, /270/);
  assert.match(unfaithful(text, text.replace('Coworker', 'the assistant'))!, /coworker/);
  assert.match(unfaithful('One.\n\nTwo.', 'One. Two.')!, /paragraphs/);
  assert.match(
    unfaithful('The team moved the limits into a shared service that every server reads.', 'Engineers centralised quota logic so each node consults one place.')!,
    /words differ/,
  );
});

test('identifiers keep their underscores', () => {
  assert.equal(plainText('A Yard_Plan__v2 type and Is_Long_Train__c, with _emphasis_ and __bold__ removed.'), 'A Yard_Plan__v2 type and Is_Long_Train__c, with emphasis and bold removed.');
  assert.equal(plainText('$Depot.Yard_Plan__v2.Default'), '$Depot.Yard_Plan__v2.Default');
});

test('helpers', () => {
  assert.deepEqual(parseJsonLoosely('noise {"a": 1} trailing'), { a: 1 });
  assert.equal(plainText('## Heading\n\n\n\nBody *text*'), 'Heading\n\nBody text');
  assert.equal(
    canonicalUrl('https://WWW.Example.com/post/?utm_source=x&id=7#top'),
    'https://example.com/post?id=7',
  );
  assert.equal(prefilter(item, 'short'), 'too short');
  const noisy = { ...item, title: 'Our customer story', source: { ...item.source, noisy: true } };
  assert.equal(prefilter(noisy, 'Growth and synergy across the quarter. '.repeat(30)), "none of the paper's keywords");
  assert.equal(prefilter(noisy, 'How we moved our Eurostar departures to a new check list. '.repeat(20)), null);
  const japanese = { ...item, title: 'Microfrontend で React アプリの埋め込みを試す' };
  assert.equal(prefilter(japanese, 'この記事では、マイクロフロントエンドを使って React アプリを埋め込む方法を説明します。'.repeat(20)), 'not in English');
  assert.equal(prefilter(item, 'A post in English that quotes one phrase, こんにちは, and carries on about Eurostar. '.repeat(12)), null);
});

test('a paper on another subject is edited without a word about this one', () => {
  const other = definePaper({
    ...PAPER,
    name: 'The Orbit Gazette',
    topic: 'space science',
    readers: 'people who follow space science',
    relevant: 'reports a result in astronomy',
    notRelevant: 'press releases',
    sections: [{ id: 'missions', label: 'Missions' }],
    personas: [],
    sources: [{ id: 'nasa', name: 'NASA', url: 'https://www.nasa.gov/feed/', type: 'official' }],
    keywords: [],
    glossary: ['Hubble'],
    houseStyle: undefined,
    notAuthors: [],
  });
  const prompt = editorPrompt(other);
  assert.match(prompt, /editor of "The Orbit Gazette", a daily newspaper for people who follow space science/);
  assert.match(prompt, /True only if the item reports a result in astronomy\. False for press releases\./);
  assert.match(prompt, /"section": one of "missions"\./);
  assert.match(prompt, /Write these names exactly as shown every time they appear: Hubble\./);
  assert.doesNotMatch(prompt, /personas|railway|Eurostar/i);

  // With no personas, whatever the model sends for them is dropped.
  const verdict = verdictSchema(other).parse({ ...good, section: 'missions', personas: ['developer'] });
  assert.deepEqual(verdict.personas, []);
  assert.throws(() => verdictSchema(other).parse({ ...good, section: 'track-and-signals' }), /section must be one of: missions/);
  assert.throws(() => verdictSchema(PAPER).parse({ ...good, personas: ['astronaut'] }), /each persona must be one of/);
});

test('a paper that is not sound says what is wrong with it', () => {
  const problems = problemsWith({
    ...PAPER,
    name: ' ',
    timezone: 'Mars/Olympus',
    sections: [],
    sources: [
      { id: 'Bad Id', name: 'A', url: 'example.com/feed', type: 'community', personas: ['pilot'] },
      { id: 'twice', name: 'B', url: 'https://example.com/b', type: 'community', noisy: true },
      { id: 'twice', name: 'C', url: 'https://example.com/c', type: 'community' },
    ],
    keywords: [],
  });
  for (const expected of [/"name" is empty/, /not a known time zone/, /needs at least one section/, /"Bad Id" must be lower-case/, /needs a web address/, /persona "pilot"/, /share the id "twice"/, /marked noisy/]) {
    assert.ok(problems.some((problem) => expected.test(problem)), `${expected} in ${problems.join(' | ')}`);
  }
  assert.deepEqual(problemsWith(PAPER), []);
  // Colours are optional, and must be hex colours when given.
  assert.deepEqual(problemsWith({ ...PAPER, colours: { paper: '#0b1d3a', ink: '#ffffff' } }), []);
  assert.match(problemsWith({ ...PAPER, colours: { accent: 'navy' } }).join(' '), /The colour "accent" must be a hex colour/);
});
