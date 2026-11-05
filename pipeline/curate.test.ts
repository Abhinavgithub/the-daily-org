import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanHeadline as cleanHeadlineFor, curate as curateFor, editorPrompt, firstLook, firstLooks, InvalidVerdict, namesIn, parseJsonLoosely, plainText, prefilter as prefilterFor, proofread as proofreadFor, proofreadAll, unfaithful, verdictSchema } from './curate';
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

test('a refused change is put back as written, and only that field: what the Logs page says of a proof-read is true', async () => {
  // The page says "printed as written" for "kept" and "the rest printed corrected" for "corrected" with a reason (src/lib/logs.ts, proofFate).
  const original = { title: 'How Coworker reads signals', why_read: 'You learns how it reads them.', summary: 'Each hour Coworker reads 360 signals and flags the odd one.\n\nIt then waits for a person.' };
  const fixed = { ...original, why_read: 'You learn how it reads them.', summary: 'Each hour Coworker reads 360 signals and flags the odd one.\n\nIt then waits for a person.' };
  const LABEL = { title: 'headline', why_read: 'reason to read', summary: 'summary' } as const;
  const cases: { name: string; reply: object | string; refused: (keyof typeof LABEL)[] }[] = [
    { name: 'a number changed', reply: { ...fixed, summary: fixed.summary.replace('360', '400') }, refused: ['summary'] },
    { name: 'a name removed', reply: { ...fixed, summary: fixed.summary.replace('Coworker', 'the assistant') }, refused: ['summary'] },
    { name: 'paragraphs re-divided', reply: { ...fixed, summary: fixed.summary.replace('\n\n', ' ') }, refused: ['summary'] },
    { name: 'too many words changed', reply: { ...fixed, why_read: 'This piece explains the whole approach to signal triage in depth.' }, refused: ['why_read'] },
    { name: 'the headline renamed', reply: { ...fixed, title: 'How the assistant reads signals' }, refused: ['title'] },
    { name: 'every field refused', reply: { title: 'How the assistant reads signals', why_read: 'An essay on triage, approaches and philosophy, at length.', summary: 'It reads 400 signals.' }, refused: ['title', 'why_read', 'summary'] },
    { name: 'a reply that is not a story', reply: 'I fixed it for you!', refused: ['title', 'why_read', 'summary'] },
  ];
  for (const c of cases) {
    const run = client([() => ok(typeof c.reply === 'string' ? c.reply : JSON.stringify(c.reply))]);
    const result = await proofread(run.llm, original);
    const unusable = typeof c.reply === 'string';
    assert.ok(result.reason, `${c.name}: a reason is recorded`);
    for (const field of Object.keys(LABEL) as (keyof typeof LABEL)[]) {
      const refused = c.refused.includes(field);
      assert.equal(result.copy[field], refused ? original[field] : fixed[field], `${c.name}: ${field} ${refused ? 'printed as written' : 'printed corrected'}`);
      if (!unusable) assert.equal(result.reverted.some((r) => r.startsWith(`${LABEL[field]}:`)), refused, `${c.name}: ${field} named as refused`);
    }
    // "kept" exactly when nothing of the model's was printed.
    const allWritten = (Object.keys(LABEL) as (keyof typeof LABEL)[]).every((field) => result.copy[field] === original[field]);
    assert.equal(result.outcome, allWritten ? 'kept' : 'corrected', `${c.name}: outcome`);
  }

  // A name only at the start of a sentence is known from the headline, so dropping it is refused.
  const opening = { ...original, summary: 'Coworker reads 360 signals.\n\nIt then waits for a person.' };
  const run = client([() => ok(JSON.stringify({ ...fixed, summary: 'The assistant reads 360 signals.\n\nIt then waits for a person.' }))]);
  const result = await proofread(run.llm, opening);
  assert.equal(result.copy.summary, opening.summary, 'a name at the start of a sentence: printed as written');
  assert.equal(result.copy.why_read, fixed.why_read, 'the rest printed corrected');
  assert.match(result.reason!, /summary: "coworker" was removed/);
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

test('a name at the start of a sentence must survive too, and an ordinary first word may still be corrected', () => {
  const copy = { title: 'How Coworker triages signals', why_read: 'You will see what it skips.', summary: 'Coworker reads 360 signals. Its queue is short.' };
  const known = namesIn(copy, PAPER.glossary);
  assert.ok(known.has('coworker'), 'a name the headline writes mid-sentence');
  assert.ok(!known.has('how') && !known.has('you'), 'not the first word of a field');
  assert.ok(known.has('goods') && known.has('yard'), "the paper's glossary");
  assert.ok(!namesIn({ title: 'Why It Matters To The Team', why_read: '', summary: '' }).has('it'), 'a small word in a title-case phrase is not a name');

  // Known from elsewhere in the story.
  assert.match(unfaithful(copy.summary, 'The assistant reads 360 signals. Its queue is short.', known)!, /coworker/);
  assert.equal(unfaithful(copy.summary, 'The assistant reads 360 signals. Its queue is short.'), null, 'without the story, a first word is not taken for a name');
  // A name by its look, wherever it stands.
  assert.match(unfaithful('SOQL reads it. MuleSoft moves it.', 'The query reads it. MuleSoft moves it.')!, /soql/);
  assert.match(unfaithful('Fine.\n\nB2B stores use it.', 'Fine.\n\nShops use it.')!, /b2b/i);
  assert.match(unfaithful('He said: "Goods Yard first."', 'He said: "The yard first."', known)!, /goods/, 'after a colon and an opening quote');
  // Ordinary first words are still corrected.
  assert.equal(unfaithful(copy.summary, "Coworker reads 360 signals. It's queue is short.", known), null);
  assert.equal(unfaithful('Their is a queue. Its short.', "There is a queue. It's short.", known), null);
  // The name may move, as long as it is still there.
  assert.equal(unfaithful('Coworker reads it.', 'Coworker reads it.', known), null);
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

test('a source can have its own test of what belongs, and a forum post or a release may be short', async () => {
  const forum = { ...item, source: { ...item.source, type: 'discussion' as const, relevant: 'reports a confirmed fault', notRelevant: 'a request for help' } };
  const asked: string[] = [];
  const llm = {
    chat: async (messages: { role: string; content: string }[]) => {
      asked.push(...messages.map((message) => message.content));
      return { text: JSON.stringify(good), model: 'm1', inputTokens: 1, outputTokens: 1 };
    },
    noteRetry: () => {},
  };
  await curateFor(llm as never, forum, 'A post.', PAPER);
  assert.match(asked[0], /True only if the item reports a confirmed fault\. False for a request for help\./, "the source's own words stand in for the paper's");
  assert.match(asked[1], /post on a community forum/);

  asked.length = 0;
  await curateFor(llm as never, item, 'An article.', PAPER);
  assert.doesNotMatch(asked[0], /confirmed fault/, 'any other source is held to the paper');

  const words = (n: number) => 'word '.repeat(n / 5);
  assert.equal(prefilter(forum, words(250)), 'too short');
  assert.equal(prefilter(forum, words(350)), null, 'a paragraph is enough for a post');
  assert.equal(prefilter(item, words(350)), 'too short', 'but not for an article');
  assert.equal(prefilter({ ...item, source: { ...item.source, type: 'code' as const } }, words(100)), null, 'and a release can be a few lines');
});

test('the editor is shown the day\'s headlines and may say an item tells one of them again', async () => {
  const asked: string[] = [];
  const replying = (same_as: unknown) => ({
    chat: async (messages: { role: string; content: string }[]) => {
      asked.push(messages[1].content);
      return { text: JSON.stringify({ ...good, same_as }), model: 'm1', inputTokens: 1, outputTokens: 1 };
    },
    noteRetry: () => {},
  });
  const edition = ['A new timetable for the branch line', 'Signal boxes get a remote panel'];
  const told = async (same_as: unknown, shown = edition) => (await curateFor(replying(same_as) as never, item, 'text', PAPER, shown)).verdict.same_as;

  assert.equal(await told(2), 2);
  assert.match(asked[0], /Already in today's edition:\n1\. A new timetable for the branch line\n2\. Signal boxes get a remote panel\n<article>/);
  assert.equal(await told('1'), 1, 'a number sent as text');
  assert.equal(await told(null), null);
  assert.equal(await told(3), null, 'a number that is not on the list');
  assert.equal(await told('the first one'), null);

  asked.length = 0;
  assert.equal(await told(1, []), null, 'nothing to be the same as on an empty page');
  assert.doesNotMatch(asked[0], /Already in today's edition/);
  assert.equal((await curate(replying(undefined) as never, item, 'text')).verdict.same_as, null, 'a reply that leaves it out');
});

test('a forum post gets a first look, which may turn it away but not lose it', async () => {
  const forum = { ...item, source: { ...item.source, type: 'discussion' as const, relevant: 'reports a confirmed fault', notRelevant: 'a request for help' } };
  const sent: { messages: { content: string }[]; options: unknown }[] = [];
  const noted: string[] = [];
  const replying = (text: string) => ({
    chat: async (messages: { content: string }[], options: unknown) => {
      sent.push({ messages, options });
      return { text, model: 'm1', inputTokens: 1, outputTokens: 1 };
    },
    noteRetry: (cause: string) => noted.push(cause),
  });

  assert.equal(await firstLook(replying('{"relevant": false}') as never, forum, 'x'.repeat(5000), PAPER), false);
  assert.match(sent[0].messages[0].content, /True if the post reports a confirmed fault\. False for a request for help\./, "by the source's own test");
  assert.ok(sent[0].messages[1].content.length < 1700, 'only the opening of the post is sent');
  assert.deepEqual(sent[0].options, { reasoningTokens: 0 }, 'and no thinking is paid for');

  assert.equal(await firstLook(replying('```json\n{"relevant": true}\n```') as never, forum, 'A post.', PAPER), true);
  assert.equal(await firstLook(replying('I am not sure.') as never, forum, 'A post.', PAPER), null, 'an unreadable reply decides nothing');
  assert.deepEqual(noted, ['unreadable first look']);
});

test('the diagram comes in the same reply as the verdict, and a bad one costs only itself', async () => {
  const steps = { kind: 'steps', caption: 'How a departure is checked', steps: ['Check the platform', 'Run the bulk pattern'], icons: ['search', 'flow'] };
  let run = client([() => ok(JSON.stringify({ ...good, figure: steps }))]);
  let curated = await curate(run.llm, item, 'text');
  assert.deepEqual(curated.figure, steps);
  assert.equal(run.calls.length, 1);

  // A diagram that states a number the article does not: the verdict stands, without one, and no call is spent on it.
  run = client([() => ok(JSON.stringify({ ...good, figure: { kind: 'numbers', caption: 'Speed', numbers: [{ value: '99 ms', label: 'Latency' }] } }))]);
  curated = await curate(run.llm, item, 'text');
  assert.equal(curated.figure, undefined);
  assert.equal(curated.verdict.depth_score, 7);
  assert.equal(run.calls.length, 1);

  run = client([() => ok(JSON.stringify({ ...good, relevant: false, figure: steps }))]);
  assert.equal((await curate(run.llm, item, 'text')).figure, undefined, 'none for an item that is not printed');
  assert.match(editorPrompt(PAPER), /"figure"[\s\S]*The kinds of diagram/);
});

test('an edition is proof-read in one call, and a reply short of a story is not trusted for any', async () => {
  const one = { title: 'Bulk patterns for Eurostar departures', why_read: 'You will learns how to plan a departure.', summary: 'First paragraph.\n\nSecond paragraph.' };
  const two = { title: 'Timing a goods yard shunt', why_read: 'You learn the timing.', summary: 'A paragraph with an eror.' };
  const fixed = [{ id: 1, ...one, why_read: 'You will learn how to plan a departure.' }, { id: 2, ...two, summary: 'A paragraph with an error.' }];

  let run = client([() => ok(JSON.stringify({ stories: fixed }))]);
  const results = await proofreadAll(run.llm, [one, two], { paper: PAPER });
  assert.equal(run.calls.length, 1);
  assert.deepEqual(results.map((r) => r.outcome), ['corrected', 'corrected']);
  assert.equal(results[1].copy.summary, 'A paragraph with an error.');

  // One story missing: each is proof-read on its own instead.
  run = client([() => ok(JSON.stringify({ stories: [fixed[0]] })), () => ok(JSON.stringify(fixed[0])), () => ok(JSON.stringify(fixed[1]))]);
  const again = await proofreadAll(run.llm, [one, two], { paper: PAPER });
  assert.equal(run.calls.length, 3);
  assert.deepEqual(again.map((r) => r.outcome), ['corrected', 'corrected']);
  assert.equal(run.llm.retries['invalid proof'], 1);

  // In another order: not applied to the wrong stories. And the fallback stops at the call cap.
  run = client([() => ok(JSON.stringify({ stories: [fixed[1], fixed[0]] })), () => ok(JSON.stringify(fixed[0]))]);
  let calls = 1;
  const capped = await proofreadAll(run.llm, [one, two], { paper: PAPER, limit: () => (calls++ >= 2 ? 'the cap was reached' : null) });
  assert.deepEqual(capped.map((r) => r.outcome), ['corrected', 'skipped']);
  assert.equal(capped[1].copy.summary, two.summary);
});

test('forum posts get their first look together, and a muddled reply decides nothing', async () => {
  const forum = { ...item, source: { ...item.source, type: 'discussion' as const } };
  const post = (title: string) => ({ item: { ...forum, title }, text: 'A post about a fault.' });
  const posts = [post('Outage on EU42'), post('How do I add a field?'), post('Release broke flows')];
  let run = client([() => ok('{"relevant": [true, false, true]}')]);
  const answers = await firstLooks(run.llm, posts, PAPER);
  assert.equal(run.calls.length, 1);
  assert.deepEqual(posts.map(({ item }) => answers.get(item)), [true, false, true]);

  run = client([() => ok('{"relevant": [true, false]}')]);
  assert.equal((await firstLooks(run.llm, posts, PAPER)).size, 0, 'one answer short');
  run = client([]);
  assert.equal((await firstLooks(run.llm, [posts[0]], PAPER)).size, 0, 'a post alone is left to its own first look');
});
