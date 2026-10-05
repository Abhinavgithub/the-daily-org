import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countryName, pageName, parseReadership, referrerName, scaleSteps, topWithOthers, totalReadership } from './readership';

const lines = [
  '{"date":"2026-10-05","views":6,"visits":6,"countries":{"IN":4,"US":2},"pages":{"/":6},"referrers":{"":6},"devices":{"mobile":4,"desktop":2}}',
  '{"date":"2026-10-04","views":30,"visits":18,"countries":{"US":20,"IN":10},"pages":{"/":21,"/2026-10-03/":5,"/logs/":1,"/cdn-cgi/rum":2,"/section/track-and-signals/":1},"referrers":{"":17,"www.example.org":12,"bing.com":1},"devices":{"mobile":21,"desktop":9}}',
  'not json',
  '{"date":"someday","views":99}',
  '',
  // The same day saved again: the later line stands.
  '{"date":"2026-10-05","views":8,"visits":7,"countries":{"IN":6,"US":2},"pages":{"/":8},"referrers":{"":7},"devices":{"mobile":5,"desktop":3,"tablet":-1}}',
].join('\n');

test('saved days are read leniently, oldest first', () => {
  const days = parseReadership(lines);
  assert.deepEqual(days.map((day) => [day.date, day.views, day.visits]), [['2026-10-04', 30, 18], ['2026-10-05', 8, 7]]);
  assert.deepEqual(days[1].devices, { mobile: 5, desktop: 3 }, 'a count that is not a positive number is dropped');
  assert.deepEqual(parseReadership(''), []);
});

test('days add up, with pages, countries and referrers named for a reader', () => {
  const all = totalReadership(parseReadership(lines), { sections: (id) => (id === 'track-and-signals' ? 'Track and signals' : id), own: ['example.org'] });
  assert.deepEqual([all.days, all.views, all.visits], [2, 38, 25]);
  assert.deepEqual(all.countries, [{ label: 'United States', count: 22 }, { label: 'India', count: 16 }]);
  assert.deepEqual(all.pages, [
    { label: 'Front page', count: 29 },
    { label: 'Edition of 3 October 2026', count: 5 },
    { label: 'Section: Track and signals', count: 1 },
  ], 'the records page and the counting script are not reading pages');
  assert.deepEqual(all.referrers, [{ label: 'Direct', count: 24 }, { label: 'bing.com', count: 1 }], "the paper's own pages are not somewhere readers came from");
  assert.deepEqual(all.devices, [{ label: 'Mobile', count: 26 }, { label: 'Desktop', count: 12 }]);
  assert.deepEqual(all.byDay, [{ date: '2026-10-04', views: 30, visits: 18 }, { date: '2026-10-05', views: 8, visits: 7 }]);
  assert.deepEqual(totalReadership([]), { days: 0, views: 0, visits: 0, countries: [], pages: [], referrers: [], devices: [], byDay: [] });
});

test('pages, countries and referrers are named', () => {
  assert.equal(pageName('/'), 'Front page');
  assert.equal(pageName('/2026-10-04/'), 'Edition of 4 October 2026');
  assert.equal(pageName('/tag/data-360/'), 'Tag: data-360');
  assert.equal(pageName('/archive'), 'Archive');
  assert.equal(pageName('/search/?q=x'), 'Search');
  for (const path of ['/logs/', '/stats/', '/cdn-cgi/rum', '/favicon.ico', '/2026-13-45/', '/2026-10-04/extra/']) assert.equal(pageName(path), null, path);
  assert.equal(countryName('IN'), 'India');
  assert.equal(countryName(''), 'Unknown');
  assert.equal(countryName('T1'), 'T1');
  assert.equal(referrerName('www.linkedin.com'), 'linkedin.com');
  assert.equal(referrerName(''), 'Direct');
});

test('a long list keeps its top rows and adds the rest together', () => {
  const rows = [9, 7, 5, 3, 2, 1, 1].map((n, i) => ({ label: `c${i}`, count: n }));
  assert.deepEqual(topWithOthers(rows, 5).map((row) => [row.label, row.count]), [['c0', 9], ['c1', 7], ['c2', 5], ['c3', 3], ['c4', 2], ['Others', 2]]);
  assert.equal(topWithOthers(rows.slice(0, 6), 5).length, 6, 'one row over is shown as itself, not as Others');
});

test("a chart's scale steps in round numbers", () => {
  assert.deepEqual(scaleSteps(862), [0, 250, 500, 750, 1000]);
  assert.deepEqual(scaleSteps(30), [0, 10, 20, 30, 40]);
  assert.deepEqual(scaleSteps(100), [0, 25, 50, 75, 100]);
  assert.deepEqual(scaleSteps(1100), [0, 500, 1000, 1500, 2000]);
  assert.deepEqual(scaleSteps(3), [0, 1, 2, 3, 4]);
  assert.deepEqual(scaleSteps(0), [0, 1, 2, 3, 4]);
  for (const most of [1, 7, 19, 64, 430, 5200, 99999]) {
    const steps = scaleSteps(most);
    assert.ok(steps[4] >= most && steps.every(Number.isInteger), `${most}: ${steps}`);
  }
});
