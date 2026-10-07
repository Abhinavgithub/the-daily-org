import assert from 'node:assert/strict';
import { test } from 'node:test';
import { enforcedNow, headlines, linkTo, matches, printed, readEdition, type Edition } from './release-edition';

const feature = (name: string, product: string, score: number) => ({ topic: `t-${name}`, product, name, says: `${name} does something.`, score });
const edition: Edition = {
  release: { name: "Winter '27", number: '264.0.0', slug: 'winter-27' },
  builtAt: '2026-10-07T00:00:00Z',
  model: 'm1',
  link: 'https://notes.example/{topic}?release=264',
  areas: [
    { name: 'Automation', topic: 'a', features: [feature('Retry', 'Flow Builder', 9), feature('Filter', 'Flow Builder', 8), feature('Suspend', 'Approvals', 8), feature('Shortcuts', 'Flow Builder', 5), feature('Test mode', 'Flow Builder', 9)] },
    { name: 'Platform', topic: 'p', features: [feature('Heap', 'Apex', 9), feature('Rename', 'DevOps', 8)] },
    { name: 'Sales', topic: 's', features: [feature('Keywords', 'Activity Capture', 7)] },
  ],
  enforced: [
    { topic: 'e1', name: 'SOAP login', says: 'It changes.', when: 'Enforced with This Release', deadline: '1 Dec 2026' },
    { topic: 'e2', name: 'Later', says: 'It will.', when: 'Scheduled to Be Enforced in Spring ’27' },
    { topic: 'e3', name: 'Dropped', says: 'It will not.', when: 'Canceled Updates' },
  ],
};

test('what is printed clears the bar, under its product, and an area with nothing left is left out', () => {
  const areas = printed(edition, 8);
  assert.deepEqual(areas.map((area) => [area.name, area.count]), [['Automation', 4], ['Platform', 2]]);
  assert.deepEqual(areas[0].products.map((product) => [product.name, product.features.map((f) => f.name)]), [['Flow Builder', ['Retry', 'Filter', 'Test mode']], ['Approvals', ['Suspend']]]);
  assert.deepEqual(printed(edition, 9).map((area) => area.count), [2, 1]);
  assert.equal(printed(edition).length, 2, 'the bar is eight unless told otherwise');
});

test('the headlines are the highest scoring, taken from each area in turn', () => {
  assert.deepEqual(headlines(edition, 8, 4).map((f) => `${f.area}: ${f.name}`), ['Automation: Retry', 'Platform: Heap', 'Automation: Test mode', 'Automation: Filter']);
  assert.deepEqual(headlines(edition, 8, 2).map((f) => f.name), ['Retry', 'Heap'], 'not two from one area while another waits');
  assert.equal(headlines(edition, 8).length, 6);
  assert.deepEqual(headlines({ ...edition, areas: [] }), []);
});

test('the headlines the editor chose lead, in the order chosen, and the rest are filled in as before', () => {
  const pick = (name: string) => ({ topic: `t-${name}`, name });
  const chosen = { ...edition, headlines: [pick('Rename'), pick('Test mode'), pick('Shortcuts'), pick('Gone'), pick('Rename')] };
  assert.deepEqual(headlines(chosen, 8, 4).map((f) => f.name), ['Rename', 'Test mode', 'Retry', 'Heap'], 'one below the bar, one no longer there and one named twice are passed over');
  assert.deepEqual(headlines(chosen, 8, 1).map((f) => f.name), ['Rename']);
  assert.deepEqual(headlines({ ...edition, headlines: [] }, 8, 2).map((f) => f.name), ['Retry', 'Heap']);
});

test('only what takes hold with this release is shown as enforced, and a topic leads to the notes', () => {
  assert.deepEqual(enforcedNow(edition).map((change) => change.name), ['SOAP login']);
  assert.equal(linkTo(edition, 'release-notes.rn_a.htm'), 'https://notes.example/release-notes.rn_a.htm?release=264');
});

test('enforced changes with a day named come first, the soonest at the head', () => {
  const now = 'Enforced with This Release';
  const enforced = [
    { topic: 'a', name: 'No day', says: '', when: now },
    { topic: 'b', name: 'December', says: '', when: now, deadline: '1 Dec 2026' },
    { topic: 'c', name: 'Also no day', says: '', when: now },
    { topic: 'd', name: 'November', says: '', when: now, deadline: '15 Nov 2026' },
  ];
  assert.deepEqual(enforcedNow({ ...edition, enforced }).map((change) => change.name), ['November', 'December', 'No day', 'Also no day']);
});

test('a search finds every word typed, in any order', () => {
  assert.equal(matches('Automation Flow Builder Retry flows that hit record locks', 'flow retry'), true);
  assert.equal(matches('Automation Flow Builder Retry flows', 'APEX'), false);
  assert.equal(matches('anything', '  '), true, 'nothing typed hides nothing');
});

test('what was saved is read leniently', () => {
  assert.equal(readEdition(null), undefined);
  assert.equal(readEdition({ release: { name: 'x' } }), undefined);
  assert.deepEqual(readEdition({ release: edition.release, areas: [edition.areas[2], null] })?.enforced, []);
});
