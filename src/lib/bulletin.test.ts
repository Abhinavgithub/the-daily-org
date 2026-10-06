import assert from 'node:assert/strict';
import { test } from 'node:test';
import { counted, daysApart, inWindow, unseen } from './bulletin';

test('each kind of item stays on the page for its own number of days', () => {
  assert.equal(daysApart('2026-09-22', '2026-10-06'), 14);
  assert.equal(inWindow('alert', '2026-10-06', '2026-10-06'), true, 'the day it was printed');
  assert.equal(inWindow('alert', '2026-09-23', '2026-10-06'), true, 'thirteen days on');
  assert.equal(inWindow('alert', '2026-09-22', '2026-10-06'), false, 'fourteen days on');
  assert.equal(inWindow('release', '2026-09-22', '2026-10-06'), true, 'a release stays a month');
  assert.equal(inWindow('release', '2026-09-06', '2026-10-06'), false);
  assert.equal(inWindow('community', '2026-09-30', '2026-10-06'), true);
  assert.equal(inWindow('community', '2026-09-29', '2026-10-06'), false);
  assert.equal(inWindow('alert', '2026-10-07', '2026-10-06'), false, 'nothing from after the latest edition');
});

test('the counts are what the reader has not seen, incidents apart, and a first visit is told only of the last two days', () => {
  const items = [
    { id: 'a', date: '2026-10-06', incident: true },
    { id: 'b', date: '2026-10-05' },
    { id: 'c', date: '2026-10-04', incident: true },
    { id: 'd', date: '2026-09-20' },
  ];
  assert.deepEqual(unseen(items, null, '2026-10-06'), { incidents: 1, others: 1 }, 'never opened: today and yesterday');
  assert.deepEqual(unseen(items, ['a', 'b', 'c', 'd'], '2026-10-06'), { incidents: 0, others: 0 }, 'opened since');
  assert.deepEqual(unseen([...items, { id: 'e', date: '2026-10-07', incident: true }], ['a', 'b', 'c', 'd'], '2026-10-07'), { incidents: 1, others: 0 }, 'an incident has arrived since');
  assert.deepEqual(unseen(items, [], '2026-10-06'), { incidents: 2, others: 2 }, 'opened once, when it was empty');
  assert.deepEqual(unseen([], null, '2026-10-06'), { incidents: 0, others: 0 });
});

test('a tool release is not counted on the tab', () => {
  assert.equal(counted('release'), false);
  assert.equal(counted('alert'), true);
  assert.equal(counted('community'), true);
});
