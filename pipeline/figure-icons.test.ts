import assert from 'node:assert/strict';
import { test } from 'node:test';
import { iconLabels, readIcons, wantsIcons } from './figure-icons';

test('a pictogram is asked for each step, part or number, and for each side of a comparison', () => {
  assert.deepEqual(iconLabels({ kind: 'steps', caption: 'c', steps: ['Build', 'Test'] }), ['Build', 'Test']);
  assert.deepEqual(iconLabels({ kind: 'compare', caption: 'c', left: { heading: 'Before', points: ['a', 'b'] }, right: { heading: 'Now', points: ['c', 'd'] } }), ['Before', 'Now']);
  assert.deepEqual(iconLabels({ kind: 'numbers', caption: 'c', numbers: [{ value: '5', label: 'Orgs' }] }), ['Orgs']);
});

test('only a diagram with no pictograms is given them', () => {
  assert.ok(wantsIcons({ kind: 'steps', caption: 'c', steps: ['a', 'b'] }));
  assert.ok(!wantsIcons({ kind: 'steps', caption: 'c', steps: ['a', 'b'], icons: ['code', 'test'] }));
  assert.ok(!wantsIcons({ kind: 'none' }));
  assert.ok(!wantsIcons(undefined));
});

test("the model's answer is kept only when it names one known pictogram for each label", () => {
  assert.deepEqual(readIcons('{"icons": ["code", "test"]}', 2), ['code', 'test']);
  assert.deepEqual(readIcons('Sure: {"icons":["code","test"]} done', 2), ['code', 'test']);
  assert.equal(readIcons('{"icons": ["code"]}', 2), undefined, 'one short');
  assert.equal(readIcons('{"icons": ["code", "unicorn"]}', 2), undefined, 'not one the page can draw');
  assert.equal(readIcons('{"icons": null}', 2), undefined, 'none fit');
  assert.equal(readIcons('no json', 2), undefined);
});
