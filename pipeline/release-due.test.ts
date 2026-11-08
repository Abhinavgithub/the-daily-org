import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Edition } from '../src/lib/release-edition';
import type { Release } from '../src/lib/releases';
import { due, productionDay, waiting } from './release-due';

const edition = (name: string, number: string, builtAt: string): Edition => ({ release: { name, number, slug: name }, builtAt, model: 'm1', link: '', areas: [], enforced: [] });
const winter: Release = {
  name: "Winter '27",
  stages: [
    { place: 'sandboxes', from: '2026-09-05', to: '2026-09-05' },
    { place: 'production', from: '2026-10-03', to: '2026-10-03' },
    { place: 'production', from: '2026-10-09', to: '2026-10-10' },
  ],
};
const spring: Release = { name: "Spring '27", stages: [{ place: 'sandboxes', from: '2027-01-09', to: '2027-01-09' }, { place: 'production', from: '2027-02-19', to: '2027-02-20' }] };
const early = edition("Winter '27", '264.0.0', '2026-10-07T04:00:00Z');

test('a release has reached production on the last day of its last stage there', () => {
  assert.equal(productionDay(winter), '2026-10-10');
  assert.equal(productionDay({ name: 'x', stages: [{ place: 'sandboxes', from: '2027-01-09', to: '2027-01-09' }] }), undefined);
  assert.equal(productionDay(undefined), undefined);
});

test('an edition is built when the notes appear, and once more when the release has reached production', () => {
  assert.deepEqual(due([], [winter], '264.0.0', '2026-09-01'), [{ number: '264.0.0', reason: 'new' }]);
  assert.deepEqual(due([early], [winter], '264.0.0', '2026-10-09'), [], 'not while the release is still arriving');
  assert.deepEqual(due([early], [winter], '264.0.0', '2026-10-10'), [{ number: '264.0.0', reason: 'production' }]);
  assert.deepEqual(due([edition("Winter '27", '264.0.0', '2026-10-10T05:00:00Z')], [winter], '264.0.0', '2026-10-11'), [], 'and not built a third time');
  assert.deepEqual(due([early], [], '264.0.0', '2026-12-01'), [], 'with no date for it there is no second build');
  assert.deepEqual(due([early], [winter], undefined, '2026-10-10'), [{ number: '264.0.0', reason: 'production' }], 'the second build does not need the notes to say which is newest');
  assert.deepEqual(due([early], [winter, spring], '266.0.0', '2026-12-15'), [{ number: '266.0.0', reason: 'new' }, { number: '264.0.0', reason: 'production' }]);
});

test('the notes are asked only while something is awaited', () => {
  const done = edition("Winter '27", '264.0.0', '2026-10-10T05:00:00Z');
  assert.equal(waiting([done], [winter], '2026-10-16'), false, 'every release named has its finished edition, checked within the week');
  assert.equal(waiting([done], [winter], '2026-11-01'), true, 'a week on, its notes are owed a check');
  assert.equal(waiting([done], [winter, spring], '2026-11-01'), true, 'a release is coming that has no edition');
  assert.equal(waiting([early], [winter], '2026-10-08'), false);
  assert.equal(waiting([early], [winter], '2026-10-10'), true, 'the second build is owed');
  assert.equal(waiting([done], [], '2026-11-01'), true, 'with no calendar there is no telling');
});

test('after both builds, the notes are checked once a week while the release is current', () => {
  const done = edition("Winter '27", '264.0.0', '2026-10-10T05:00:00Z');
  assert.deepEqual(due([done], [winter], '264.0.0', '2026-10-16'), [], 'six days on');
  assert.deepEqual(due([done], [winter], '264.0.0', '2026-10-17'), [{ number: '264.0.0', reason: 'refresh' }], 'seven days on');
  const checked = { ...done, checkedAt: '2026-11-08T06:00:00Z' };
  assert.deepEqual(due([checked], [winter], '264.0.0', '2026-11-14'), [], 'counted from the last check, not the build');
  assert.deepEqual(due([checked], [winter], '264.0.0', '2026-11-15'), [{ number: '264.0.0', reason: 'refresh' }]);
  assert.deepEqual(due([early], [winter], '264.0.0', '2026-10-09'), [], 'not before the second build');
});

test('the release before the newest is checked until its successor reaches production, and then no more', () => {
  const winterDone = { ...edition("Winter '27", '264.0.0', '2026-10-10T05:00:00Z'), checkedAt: '2026-12-01T00:00:00Z' };
  const springDone = { ...edition("Spring '27", '266.0.0', '2027-02-20T05:00:00Z'), checkedAt: '2027-02-01T00:00:00Z' };
  const springEarly = edition("Spring '27", '266.0.0', '2027-01-05T05:00:00Z');
  assert.deepEqual(due([springEarly, winterDone], [winter, spring], '266.0.0', '2027-01-10'), [{ number: '264.0.0', reason: 'refresh' }], 'Spring is not yet in production, so Winter is still what most orgs run');
  assert.deepEqual(
    due([springDone, winterDone], [winter, spring], '266.0.0', '2027-02-27').map((one) => one.number),
    ['266.0.0'],
    'once Spring is in production, only it is checked',
  );
});
