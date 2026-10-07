import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deadlineIn, enforcedFrom, featuresIn, KEEP_FROM, linesFor, pickHeadlines, slugOf } from './release-edition';
import type { Entry } from './release-notes';
import { PAPER } from './testing';

const entries: (Entry & { product: string })[] = [
  { topic: 'release-notes.rn_a.htm', title: 'Screen Flow Updates', text: 'Run a screen flow on many records. Capture time values.', kind: 'child', product: 'Flow Builder' },
  { topic: 'release-notes.rn_b.htm', title: 'Edit History', text: 'Track flow changes over time.', kind: 'feature', product: 'Flow Builder' },
];
const answering = (texts: string[]) => {
  const asked: string[][] = [];
  const llm = {
    chat: async (messages: { content: string }[]) => {
      asked.push(messages.map((message) => message.content));
      return { text: texts.shift() ?? '{}', model: 'm1', inputTokens: 1, outputTokens: 1 };
    },
    noteRetry: () => {},
  };
  return { llm: llm as never, asked };
};

test('the model is shown each entry on a line, under the number it must cite', () => {
  assert.equal(linesFor(entries), '1 | Flow Builder | Screen Flow Updates | Run a screen flow on many records. Capture time values.\n2 | Flow Builder | Edit History | Track flow changes over time.');
});

test('a feature is kept only if it cites an entry the notes gave, is usable, and scores enough', async () => {
  const reply = JSON.stringify({
    features: [
      { entry: 1, name: 'Run a screen flow on many records', says: 'Run a screen flow from a list view on several records at once.', score: '8' },
      { entry: '1', name: 'Capture time values', says: 'A new Time component captures time values.', score: 6 },
      { entry: 3, name: 'A feature the notes do not have', says: 'It is not in the notes at all.', score: 9 },
      { entry: 'Flow Builder', name: 'Cited by its product, not its number', says: 'It cannot be traced to an entry.', score: 9 },
      { entry: 2, name: 'Edit history', says: 'Track flow changes.', score: KEEP_FROM - 1 },
      { entry: 2, name: 'x', says: 'too short a name', score: 9 },
      'not a feature',
    ],
  });
  const { llm, asked } = answering([`Here you are:\n${reply}`]);
  const features = await featuresIn(llm, entries, "Winter '27", 'Automation', PAPER);
  assert.deepEqual(features.map((feature) => [feature.name, feature.score]), [['Run a screen flow on many records', 8], ['Capture time values', 6]]);
  assert.deepEqual([features[0].topic, features[0].product], ['release-notes.rn_a.htm', 'Flow Builder'], 'where it leads and what it is filed under are the notes\' own');
  assert.match(asked[0][0], /special edition on the Winter '27 release.*"Automation" area/s);
});

test('a reply that cannot be read is asked for once more, and then the batch is given up', async () => {
  const good = JSON.stringify({ features: [{ entry: 2, name: 'Edit history', says: 'Track flow changes over time.', score: 7 }] });
  const second = answering(['no json here', good]);
  assert.equal((await featuresIn(second.llm, entries, "Winter '27", 'Automation', PAPER)).length, 1);
  assert.equal(second.asked.length, 2);
  const never = answering(['nope', 'still nope']);
  assert.deepEqual(await featuresIn(never.llm, entries, "Winter '27", 'Automation', PAPER), []);
});

test('an enforced change keeps Salesforce’s own words, whole sentences, and its day when one is named', () => {
  const [soap, access] = enforcedFrom([
    { topic: 't1', title: 'Assign Use Any API Auth Permission for SOAP login() (Release Update)', text: 'To authenticate with the SOAP API login() operation, all users must have the Use Any API Auth user permission. Users without it get an error. Beginning December 1, 2026, this is enforced across all orgs. You can test in advance.', group: 'Enforced with This Release', kind: 'term' },
    { topic: 't2', title: 'Enable Accessibility Enhancements for Date Pickers (Release Update)', text: 'To help meet Web Content Accessibility Guidelines (WCAG) 2.2 for Resize and Reflow, enable the new behaviour. This update depends on another.', group: 'Enforced with This Release', kind: 'term' },
    { topic: 't3', title: 'A product', text: 'Not a change.', kind: 'child' },
  ]);
  assert.deepEqual(soap, { topic: 't1', name: 'Assign Use Any API Auth permission for SOAP login()', says: 'To authenticate with the SOAP API login() operation, all users must have the Use Any API Auth user permission. Users without it get an error.', when: 'Enforced with This Release', deadline: '1 Dec 2026' });
  assert.equal(access.says, 'To help meet Web Content Accessibility Guidelines (WCAG) 2.2 for Resize and Reflow, enable the new behaviour. This update depends on another.', 'a version number does not end a sentence');
  assert.equal(access.name, 'Enable accessibility enhancements for date pickers', 'the title is set in sentence case');
  assert.equal(access.deadline, undefined);
  assert.equal(deadlineIn('Enforced starting March 15, 2027 in production.'), '15 Mar 2027');
  assert.equal(slugOf("Winter '27"), 'winter-27');
});

test('the editor chooses the headlines from the highest scoring, no more than two from an area', async () => {
  const f = (name: string, score: number) => ({ topic: `t-${name}`, product: 'P', name, says: `${name} changes.`, score });
  const areas = [
    { name: 'Automation', topic: 'a', features: [f('A1', 9), f('A2', 9), f('A3', 9), f('A4', 6)] },
    { name: 'Platform', topic: 'p', features: [f('P1', 9), f('P2', 8)] },
  ];
  // Shown in order of score, then of the notes: A1, A2, A3, P1, P2, A4.
  const { llm, asked } = answering(['not json', '{"headlines": [3, 99, 1, 2, 3, 5]}']);
  assert.deepEqual((await pickHeadlines(llm, areas, "Winter '27", 3, PAPER)).map((pick) => pick.name), ['A3', 'A1', 'P2'], 'a number not on the list, one given twice and a third from one area are passed over');
  assert.equal(asked.length, 2, 'a reply that cannot be read is asked for again');
  assert.match(asked[0][1], /^1 \| Automation \| P \| A1 \| A1 changes\.\n2 \| Automation/);
  // With no more features than places there is nothing to ask.
  const few = answering([]);
  assert.deepEqual((await pickHeadlines(few.llm, [areas[1]], "Winter '27", 3, PAPER)).map((pick) => pick.name), ['P1', 'P2']);
  assert.equal(few.asked.length, 0);
});
