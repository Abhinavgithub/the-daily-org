import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bulletinAsOf, counted, dateProblems, daysApart, inWindow, readSiteDates, unseen } from './bulletin';

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

test('the Bulletin is as of the latest edition, or its newest item when that is newer, and never older than the front page', () => {
  assert.equal(bulletinAsOf('2026-11-06', ['2026-10-23', '2026-11-03'], '2026-11-07'), '2026-11-06', 'a quiet Bulletin still takes the edition day');
  assert.equal(bulletinAsOf('2026-11-05', ['2026-11-06'], '2026-11-07'), '2026-11-06', 'a run that printed only to the Bulletin');
  assert.equal(bulletinAsOf(undefined, ['2026-10-23'], '2026-11-07'), '2026-10-23');
  assert.equal(bulletinAsOf(undefined, [], '2026-11-07'), '2026-11-07', 'nothing at all');
});

test("the site check passes a Bulletin as of the front page's day and names a stale one", () => {
  assert.deepEqual(dateProblems({ edition: '2026-11-06', asOf: '2026-11-06', newestItem: '2026-11-03' }), []);
  assert.deepEqual(dateProblems({ edition: '2026-11-05', asOf: '2026-11-06', newestItem: '2026-11-06' }), []);
  // The case reported from a crawl: the front page on 6 November, the Bulletin on 23 October.
  const [stale] = dateProblems({ edition: '2026-11-06', asOf: '2026-10-23', newestItem: '2026-10-23' });
  assert.match(stale, /as of 2026-10-23.*edition is 2026-11-06.*should be as of 2026-11-06/);
  assert.equal(dateProblems({ edition: '2026-11-06', asOf: '2026-11-07' }).length, 1, 'ahead of everything is wrong too');
  assert.equal(dateProblems({ edition: '2026-11-06' }).length, 1, 'a Bulletin with no date');
  assert.equal(dateProblems({ asOf: '2026-11-06' }).length, 1, 'a front page with no edition');
});

test('the dates are read from the pages as they are built', () => {
  const home = '<!DOCTYPE html><html lang="en" data-edition="2026-11-06"><head>';
  const bulletin = '<p class="ledger__note bulletin__asof">As of <time datetime="2026-11-06" data-bulletin-as-of data-newest-item="2026-11-03">Friday, 6 November 2026</time>.</p>';
  assert.deepEqual(readSiteDates(home, bulletin), { edition: '2026-11-06', asOf: '2026-11-06', newestItem: '2026-11-03' });
  assert.deepEqual(readSiteDates('<html lang="en">', 'As of Friday.'), { edition: undefined, asOf: undefined, newestItem: undefined });
});
