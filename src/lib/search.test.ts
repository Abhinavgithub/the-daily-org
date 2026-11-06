import assert from 'node:assert/strict';
import { test } from 'node:test';
import { counts, filtered, fromParams, markPattern, marks, noFilters, parse, plain, score, search, since, toParams, type Entry, type Filters } from './search';

const SYNONYMS = [
  ['OAuth password flow', 'username-password flow', 'resource owner password flow'],
  ['LWC', 'Lightning Web Component'],
  ['Data Cloud', 'Data 360'],
];

const entry = (over: Partial<Entry>): Entry => ({
  href: '/x/',
  kind: 'story',
  title: '',
  why: '',
  source: 'Salesforce Blog',
  section: 'Platform',
  date: '2026-11-01',
  day: 'Sun, 1 Nov 2026',
  tags: '',
  text: '',
  personas: [],
  signal: 'other',
  ...over,
});

test('text is compared in plain lower case, with punctuation as spaces', () => {
  assert.equal(plain('Username-Password Flow, café!'), ' username password flow cafe ');
});

test('a synonym phrase is one clause with every name of its group, longest phrase first', () => {
  const [clause, ...rest] = parse('oauth password flow', SYNONYMS);
  assert.equal(rest.length, 0, 'not read as "password" and "flow"');
  assert.deepEqual(clause.forms, ['oauth password flow', 'username password flow', 'resource owner password flow']);
  assert.deepEqual(clause.also, ['username-password flow', 'resource owner password flow']);
  assert.deepEqual(
    parse('LWC testing', SYNONYMS).map((c) => c.forms),
    [['lwc', 'lightning web component'], ['testing']],
  );
  assert.deepEqual(parse('lightning web components', SYNONYMS)[0].forms, ['lwc', 'lightning web component'], 'a plural phrase finds its group');
  assert.deepEqual(parse('components', SYNONYMS)[0].forms, ['components', 'component'], 'a plural word finds its singular');
  assert.deepEqual(parse('access', SYNONYMS)[0].forms, ['access'], 'a word ending in "ss" is not a plural');
});

test('either name of a synonym finds the other', () => {
  const index = [
    entry({ title: 'Retire the username-password flow before spring', date: '2026-10-01' }),
    entry({ title: 'OAuth password flow blocked in new orgs', date: '2026-10-02' }),
    entry({ title: 'Something else', date: '2026-10-03' }),
  ];
  assert.equal(search(index, parse('OAuth password flow', SYNONYMS)).length, 2);
  assert.equal(search(index, parse('username password flow', SYNONYMS)).length, 2);
  assert.equal(search(index, parse('Data 360', SYNONYMS)).length, 0);
});

test('a term is found at the start of a word, not inside one', () => {
  const clauses = parse('ai');
  assert.ok(score(entry({ title: 'AI agents in the org' }), clauses) > 0);
  assert.equal(score(entry({ title: 'Maintain your sandboxes' }), clauses), 0);
});

test('every part of a search must be found', () => {
  assert.equal(score(entry({ title: 'Flow testing' }), parse('flow apex')), 0);
  assert.ok(score(entry({ title: 'Flow testing', text: 'Apex too' }), parse('flow apex')) > 0);
});

test('a find in the headline outranks one in the line under it, which outranks one in the text', () => {
  const clauses = parse('governor');
  const title = score(entry({ title: 'Governor limits explained' }), clauses);
  const why = score(entry({ why: 'Governor limits explained' }), clauses);
  const text = score(entry({ text: 'Governor limits explained' }), clauses);
  assert.ok(title > why && why > text, `${title} > ${why} > ${text}`);
});

test('a whole word outranks the start of a longer one, and more mentions in the text count for a little more', () => {
  const clauses = parse('flow');
  assert.ok(score(entry({ title: 'Flow' }), clauses) > score(entry({ title: 'Flows' }), clauses));
  const once = score(entry({ text: 'flow' }), clauses);
  const often = score(entry({ text: 'flow flow flow flow' }), clauses);
  assert.ok(often > once && often < score(entry({ why: 'flow' }), clauses), 'repeating a word in the text never beats the line under the headline');
});

test('the headline holding the whole search as typed counts most', () => {
  const clauses = parse('record triggered flow');
  const phrase = score(entry({ title: 'Record triggered flow tips' }), clauses);
  const scattered = score(entry({ title: 'Flow tips for record pages, triggered nightly' }), clauses);
  assert.ok(phrase > scattered);
});

test('best match ranks by score and then by date; newest ranks by date alone', () => {
  const index = [
    entry({ title: 'Old headline about Apex', date: '2026-09-01' }),
    entry({ text: 'apex', date: '2026-11-01', title: 'New, Apex in the text' }),
    entry({ text: 'apex', date: '2026-10-01', title: 'Middle' }),
  ];
  const clauses = parse('apex');
  assert.deepEqual(
    search(index, clauses).map((e) => e.date),
    ['2026-11-01', '2026-09-01', '2026-10-01'],
  );
  assert.deepEqual(
    search(index, clauses, 'newest').map((e) => e.date),
    ['2026-11-01', '2026-10-01', '2026-09-01'],
  );
});

test('marks find what was searched as the text writes it', () => {
  const pattern = markPattern(marks(parse('oauth password flow', SYNONYMS)))!;
  assert.deepEqual('Retire the Username-Password Flow now'.match(pattern), ['Username-Password Flow']);
  assert.equal('xlwc'.match(markPattern(['lwc'])!), null, 'not inside a word');
  assert.equal(markPattern([]), null);
});

test('the dates a search looks at', () => {
  const f = (over: Partial<Filters>): Filters => ({ ...noFilters(), ...over });
  assert.equal(since(f({}), '2026-11-06'), undefined);
  assert.equal(since(f({ when: 'week' }), '2026-11-06'), '2026-10-31', 'seven days, today among them');
  assert.equal(since(f({ when: 'month' }), '2026-11-06'), '2026-10-08');
  const index = [entry({ date: '2026-10-30' }), entry({ date: '2026-11-03' }), entry({ date: '2026-11-06' })];
  assert.equal(filtered(index, f({ when: 'week' }), '2026-11-06').length, 2);
  assert.equal(filtered(index, f({ when: 'between', from: '2026-10-30', to: '2026-11-03' }), '2026-11-06').length, 2, 'both ends are included');
  assert.equal(filtered(index, f({ when: 'between', to: '2026-11-01' }), '2026-11-06').length, 1, 'an open start');
});

test('each filter, and what the boxes beside it count', () => {
  const index = [
    entry({ kind: 'story', section: 'Flow and admin', source: 'Salesforce Ben', personas: ['admin'], signal: 'must' }),
    entry({ kind: 'story', section: 'LWC and UI', source: 'Salesforce Developers Blog', personas: ['developer'], signal: 'recommended' }),
    entry({ kind: 'brief', section: 'Flow and admin', source: 'dev.to', personas: ['admin'] }),
    entry({ kind: 'bulletin', section: 'Bulletin', source: 'Salesforce Developers Blog' }),
    entry({ kind: 'release', section: 'Release notes', source: "Winter '27 release notes" }),
  ];
  const today = '2026-11-06';
  const with_ = (over: Partial<Filters>) => filtered(index, { ...noFilters(), ...over }, today).length;
  assert.equal(with_({}), 5);
  assert.equal(with_({ kind: ['story', 'brief'] }), 3);
  assert.equal(with_({ kind: ['release'] }), 1);
  assert.equal(with_({ section: ['Flow and admin'] }), 2);
  assert.equal(with_({ section: ['Bulletin'] }), 0, 'the Bulletin is a kind, not a section');
  assert.equal(with_({ source: ['Salesforce Developers Blog'] }), 2);
  assert.equal(with_({ show: ['recommended'] }), 2, 'must-read counts as recommended');
  assert.equal(with_({ show: ['must'] }), 1);
  assert.equal(with_({ for: ['admin'], kind: ['story'] }), 1, 'groups are combined');
  // With Stories ticked, each kind's box counts what ticking it alone would show, and each source's counts stories only.
  const filters = { ...noFilters(), kind: ['story'] };
  assert.deepEqual([...counts(index, filters, today, 'kind', ['story', 'brief', 'bulletin', 'release']).values()], [2, 1, 1, 1]);
  assert.deepEqual([...counts(index, filters, today, 'source', ['Salesforce Developers Blog', 'dev.to']).values()], [1, 0]);
});

test('a search and its filters survive the address and back', () => {
  const filters: Filters = { ...noFilters(), kind: ['story'], source: ["Winter '27 release notes", 'A, B & C'], section: ['Flow and admin'], when: 'between', from: '2026-10-01', to: '2026-11-06' };
  const params = toParams('oauth flow', filters, 'newest');
  assert.equal(fromParams(`?${params}`).query, 'oauth flow');
  assert.deepEqual(fromParams(params).filters, filters, 'a comma inside a value is kept');
  assert.equal(fromParams(params).sort, 'newest');
  assert.equal(toParams('', filters, 'newest'), '', 'no search, nothing to remember');
  assert.deepEqual(fromParams('?q=flow&when=forever&from=yesterday').filters, noFilters(), 'nonsense is ignored');
  assert.equal(fromParams('?q=a+b').query, 'a b', 'a space written as + by a form');
});
