import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countdown, deadlinesFrom, dueWithin, groupLine, grouped, releaseName, releaseOrder, storiesAbout, timingOf } from './deadlines';
import type { Edition, Enforced } from './release-edition';
import type { Release } from './releases';

const edition = (name: string, number: string, enforced: Enforced[]): Edition => ({
  release: { name, number, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
  builtAt: '2026-10-01T00:00:00Z',
  model: 'm1',
  link: `https://help.example.com/{topic}?release=${number}`,
  areas: [],
  enforced,
});
const update = (topic: string, when: string, extra: Partial<Enforced> = {}): Enforced => ({ topic, name: topic, says: `${topic} changes.`, when, ...extra });

const releases: Release[] = [
  { name: "Winter '27", stages: [{ place: 'sandboxes', from: '2026-10-10', to: '2026-10-10' }] },
  {
    name: "Spring '27",
    stages: [
      { place: 'sandboxes', from: '2027-02-06', to: '2027-02-06' },
      { place: 'production', from: '2027-02-19', to: '2027-02-20' },
    ],
  },
];

test('a release is named the paper’s way whatever quote the notes use, and releases fall in the order they come out', () => {
  assert.equal(releaseName('Scheduled to Be Enforced in Spring ’27'), "Spring '27");
  assert.equal(releaseName('before WINTER 28'), "Winter '28");
  assert.equal(releaseName('Canceled Updates'), undefined);
  const order = ["Summer '27", "Winter '28", "Winter '27", "Spring '27"].sort((a, b) => releaseOrder(a) - releaseOrder(b));
  assert.deepEqual(order, ["Winter '27", "Spring '27", "Summer '27", "Winter '28"]);
});

test('the notes’ sections are read as timings', () => {
  assert.deepEqual(timingOf('Enforced with This Release', "Winter '27"), { kind: 'in', release: "Winter '27" });
  assert.deepEqual(timingOf('Scheduled To Be Enforced Before Spring ’27', "Winter '27"), { kind: 'before', release: "Spring '27" });
  assert.deepEqual(timingOf('Scheduled to Be Enforced in Summer ’27', "Winter '27"), { kind: 'in', release: "Summer '27" });
  assert.deepEqual(timingOf('Canceled Updates', "Winter '27"), { kind: 'cancelled' });
  assert.deepEqual(timingOf('Not Yet Scheduled', "Winter '27"), { kind: 'unknown' });
});

test('an update listed by two editions keeps the newest one’s timing, and called-off updates are left out', () => {
  const older = edition("Winter '27", '258.0.0', [update('moved', 'Scheduled to Be Enforced in Spring ’27'), update('kept', 'Enforced with This Release')]);
  const newer = edition("Spring '27", '260.0.0', [update('moved', 'Scheduled to Be Enforced in Summer ’27'), update('dropped', 'Canceled Updates')]);
  const all = deadlinesFrom([older, newer]);
  assert.deepEqual(
    all.map((one) => [one.topic, one.timing, one.from]),
    [
      ['moved', { kind: 'in', release: "Summer '27" }, "Spring '27"],
      ['kept', { kind: 'in', release: "Winter '27" }, "Winter '27"],
    ],
  );
  assert.equal(all[0].link, 'https://help.example.com/moved?release=260.0.0', 'the link is to the edition it was taken from');
});

test('what is to come leads, soonest first with a release’s "before" band above it; what is in force follows', () => {
  const all = deadlinesFrom([
    edition("Winter '27", '258.0.0', [
      update('summer', 'Scheduled to Be Enforced in Summer ’27'),
      update('spring', 'Scheduled to Be Enforced in Spring ’27'),
      update('soon', 'Scheduled To Be Enforced Before Spring ’27'),
      update('now', 'Enforced with This Release'),
      update('late', 'Enforced with This Release', { deadline: '1 Dec 2026' }),
      update('dated', 'Scheduled to Be Enforced in Spring ’27', { deadline: '1 Feb 2027' }),
    ]),
  ]);
  const groups = grouped(all, releases, '2026-10-24');
  assert.deepEqual(
    groups.map((group) => [group.kind, group.release, group.due, group.past]),
    [
      ['in', "Winter '27", '2026-12-01', false],
      ['before', "Spring '27", '2027-02-06', false],
      ['in', "Spring '27", '2027-02-01', false],
      ['in', "Summer '27", undefined, false],
      ['in', "Winter '27", '2026-10-10', true],
    ],
  );
  assert.deepEqual(groups[0].items.map((item) => item.topic), ['late'], 'a day named after its release has arrived is still to come');
  assert.deepEqual(groups[2].items.map((item) => item.topic), ['dated', 'spring'], 'a named day comes first');
  assert.equal(groupLine(groups[1], '2026-10-24'), "Any time before Spring '27 arrives · Sandboxes 6 Feb 2027 · Production 19 to 20 Feb 2027 · in 3 months");
  assert.equal(groupLine(groups[3], '2026-10-24'), 'Dates not yet announced');
  assert.equal(groupLine(groups[4], '2026-10-24'), 'In force · Sandboxes 10 Oct');
  assert.equal(dueWithin(groups, '2026-10-24'), 0);
  assert.equal(dueWithin(groups, '2026-11-10'), 1, 'an update’s own day counts');
  assert.equal(dueWithin(groups, '2027-01-15'), 2, 'the band due before Spring ’27, and the update dated 1 Feb, are within 30 days');
  assert.equal(dueWithin(groups, '2027-02-02'), 2, 'what falls due today or before is not counted');
});

test('a countdown is said in days, weeks or months', () => {
  assert.equal(countdown('2026-10-24', '2026-10-24'), 'today');
  assert.equal(countdown('2026-10-24', '2026-10-25'), 'tomorrow');
  assert.equal(countdown('2026-10-24', '2026-10-30'), 'in 6 days');
  assert.equal(countdown('2026-10-24', '2026-11-28'), 'in 5 weeks');
  assert.equal(countdown('2026-10-24', '2027-02-19'), 'in 4 months');
});

test('the stories about an update are those that use one of its phrases, newest first', () => {
  const [deadline] = deadlinesFrom([edition("Winter '27", '258.0.0', [update('t', 'Enforced with This Release', { phrases: ['Username-Password Flow', 'oauth'] })])]);
  const stories = [
    { text: 'Retiring the username-password flow', date: '2026-10-01' },
    { text: 'Something else about OAuth', date: '2026-10-05' },
    { text: 'The username-password flow, again', date: '2026-10-20' },
  ];
  assert.deepEqual(storiesAbout(deadline, stories).map((story) => story.date), ['2026-10-20', '2026-10-01'], 'a phrase too short to tell is not used');
  assert.deepEqual(storiesAbout({ ...deadline, phrases: undefined }, stories), []);
});
