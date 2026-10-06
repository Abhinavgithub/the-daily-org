import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openReleases, readReleases, sentence, type Release } from './releases';

const winter: Release = {
  name: "Winter '27",
  who: 'orgs',
  stages: [
    { place: 'sandboxes', from: '2026-09-05', to: '2026-09-05' },
    { place: 'production', from: '2026-10-03', to: '2026-10-03' },
    { place: 'production', from: '2026-10-09', to: '2026-10-10' },
  ],
};
const spring: Release = {
  name: "Spring '27",
  who: 'orgs',
  stages: [
    { place: 'sandboxes', from: '2027-01-09', to: '2027-01-09' },
    { place: 'production', from: '2027-02-06', to: '2027-02-06' },
    { place: 'production', from: '2027-02-19', to: '2027-02-20' },
  ],
};

test('the line leads with the next date and moves on as each one passes', () => {
  assert.equal(sentence(spring, '2026-12-15'), "Spring '27 reaches sandboxes on 9 Jan 2027. Production: 6 Feb 2027 and 19 to 20 Feb 2027.");
  assert.equal(sentence(spring, '2027-01-02'), "Spring '27 reaches sandboxes on 9 Jan. Production: 6 Feb and 19 to 20 Feb.");
  assert.equal(sentence(spring, '2027-01-09'), "Spring '27 is in sandboxes. Production: 6 Feb and 19 to 20 Feb.");
  assert.equal(sentence(spring, '2027-02-06'), "Spring '27 is arriving in production. Last orgs get it 19 to 20 Feb.");
  assert.equal(sentence(winter, '2026-10-06'), "Winter '27 is arriving in production. Last orgs get it 9 to 10 Oct.");
  assert.equal(sentence(winter, '2026-10-10'), "Winter '27 is arriving in production. Last orgs get it 9 to 10 Oct.");
});

test('days that span a month are said in full', () => {
  const release: Release = { name: 'R', stages: [{ place: 'production', from: '2026-01-30', to: '2026-02-01' }] };
  assert.equal(sentence(release, '2026-01-01'), 'R reaches production on 30 Jan to 1 Feb.');
});

test('the releases to speak of are any under way and the next to come', () => {
  const both = [spring, winter];
  const names = (today: string) => openReleases(both, today).map((open) => open.release.name);
  assert.deepEqual(names('2026-08-01'), ["Winter '27"], 'only the next, when none has begun');
  assert.deepEqual(names('2026-10-06'), ["Winter '27", "Spring '27"], 'one under way, and the one after it');
  assert.deepEqual(names('2026-10-10'), ["Winter '27", "Spring '27"], 'its last day still counts');
  assert.deepEqual(names('2026-10-11'), ["Spring '27"]);
  assert.deepEqual(names('2027-02-21'), [], 'nothing known beyond the last');
  assert.deepEqual(openReleases([], '2026-10-06'), []);
});

test('what was saved is read leniently', () => {
  assert.deepEqual(readReleases(null), []);
  assert.deepEqual(readReleases([{ name: 'A', stages: [{ place: 'production', from: 'soon', to: 'later' }] }, { name: 'B' }, winter]), [winter]);
});

test('several waves still to come are said as more, and a calendar that names nobody speaks of waves', () => {
  const three: Release = { name: 'R', who: 'orgs', stages: [...spring.stages, { place: 'production', from: '2027-03-06', to: '2027-03-06' }] };
  assert.equal(sentence(three, '2027-02-06'), 'R is arriving in production. More orgs get it 19 to 20 Feb and 6 Mar.');
  const nobody: Release = { name: "Winter '27", stages: winter.stages };
  assert.equal(sentence(nobody, '2026-10-06'), "Winter '27 is arriving in production. Still to come: 9 to 10 Oct.");
  assert.equal(sentence(nobody, '2026-10-10'), "Winter '27 is arriving in production. Last wave: 9 to 10 Oct.");
});

test('the line comes with its name apart, for the page to set in bold', () => {
  const [open] = openReleases([winter], '2026-10-06');
  assert.equal(open.rest, ' is arriving in production. Last orgs get it 9 to 10 Oct.');
  assert.equal(open.release.name + open.rest, open.says);
});
