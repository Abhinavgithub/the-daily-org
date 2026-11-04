import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deadlinesFrom, grouped } from './deadlines';
import { calendar, escapeText, fold } from './ics';
import type { Edition, Enforced } from './release-edition';
import type { Release } from './releases';

const edition = (enforced: Enforced[]): Edition => ({
  release: { name: "Winter '27", number: '258', slug: 'winter-27' },
  builtAt: '2026-10-01T00:00:00Z',
  model: 'm1',
  link: 'https://help.example.com/{topic}?release=258',
  areas: [],
  enforced,
});
const update = (topic: string, when: string, extra: Partial<Enforced> = {}): Enforced => ({ topic, name: topic, says: `${topic} changes.`, when, ...extra });
const releases: Release[] = [
  {
    name: "Spring '27",
    stages: [
      { place: 'sandboxes', from: '2027-02-06', to: '2027-02-06' },
      { place: 'production', from: '2027-02-19', to: '2027-02-20' },
      { place: 'production', from: '2027-03-05', to: '2027-03-05' },
    ],
  },
];
const options = { name: 'The Paper: Deadlines', page: 'https://paper.example/deadlines/', host: 'paper.example', now: new Date('2026-11-04T06:57:20.123Z') };
const make = (enforced: Enforced[]) => calendar(grouped(deadlinesFrom([edition(enforced)]), releases, '2026-11-04'), releases, options);
const events = (text: string) => text.split('BEGIN:VEVENT').slice(1).map((event) => event.replace(/\r\n /g, ''));
const field = (event: string, name: string) => event.match(new RegExp(`^${name}[:;](.*)$`, 'm'))?.[1].replace(/\r$/, '');

test('text is escaped as a calendar line holds it', () => {
  assert.equal(escapeText('a, b; c\\d\ne'), 'a\\, b\\; c\\\\d\\ne');
});

test('a long line is folded at 75 bytes, a continued piece starting with a space, and comes back whole', () => {
  const line = `DESCRIPTION:${'é'.repeat(100)}`;
  const folded = fold(line);
  for (const piece of folded.split('\r\n')) assert.ok(Buffer.byteLength(piece) <= 75);
  assert.equal(folded.replace(/\r\n /g, ''), line);
});

test('each release stage is an all-day event over its days, and two in one place are told apart', () => {
  const stages = events(make([])).filter((event) => field(event, 'SUMMARY')?.includes('reaches'));
  assert.deepEqual(
    stages.map((event) => [field(event, 'SUMMARY'), field(event, 'DTSTART'), field(event, 'DTEND'), field(event, 'UID')]),
    [
      ["Spring '27 reaches sandboxes", 'VALUE=DATE:20270206', 'VALUE=DATE:20270207', 'release-spring-27-sandboxes-1@paper.example'],
      ["Spring '27 reaches production", 'VALUE=DATE:20270219', 'VALUE=DATE:20270221', 'release-spring-27-production-1@paper.example'],
      ["Spring '27 reaches production", 'VALUE=DATE:20270305', 'VALUE=DATE:20270306', 'release-spring-27-production-2@paper.example'],
    ],
  );
});

test('an update falls on the day the notes name, or else its release’s first day if due before it and first production day if it comes with it', () => {
  const text = make([
    update('named', 'Scheduled to Be Enforced in Spring ’27', { deadline: '1 Dec 2026' }),
    update('before', 'Scheduled to Be Enforced Before Spring ’27'),
    update('with', 'Scheduled to Be Enforced in Spring ’27', { action: 'Test it in a sandbox.' }),
  ]);
  const day = (topic: string) => field(events(text).find((event) => field(event, 'SUMMARY') === topic)!, 'DTSTART');
  assert.equal(day('named'), 'VALUE=DATE:20261201');
  assert.equal(day('before'), 'VALUE=DATE:20270206');
  assert.equal(day('with'), 'VALUE=DATE:20270219');
  const description = field(events(text).find((event) => field(event, 'SUMMARY') === 'with')!, 'DESCRIPTION')!;
  assert.match(description, /What to do: Test it in a sandbox\./);
  assert.match(description, /Deadlines: https:\/\/paper\.example\/deadlines\//);
});

test('an update with no day to give it is left out until it has one', () => {
  const text = make([update('later', 'Scheduled to Be Enforced in Summer ’27'), update('nowhere', 'Some other heading')]);
  assert.equal(events(text).filter((event) => !field(event, 'SUMMARY')?.includes('reaches')).length, 0);
});

test('the file is CRLF throughout, stamped in UTC, and asks to be read again daily', () => {
  const text = make([]);
  assert.ok(text.startsWith('BEGIN:VCALENDAR\r\n') && text.endsWith('END:VCALENDAR\r\n'));
  assert.ok(!/[^\r]\n/.test(text));
  assert.match(text, /DTSTAMP:20261104T065720Z/);
  assert.match(text, /REFRESH-INTERVAL;VALUE=DURATION:P1D/);
});
