import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { RunLogData, LogArticle } from './logs';
import { feedsFrom, flagsFrom, repeatOf, heldFrom, history, ISSUE_AFFECTED, issuesFrom, markDone, queue, readDone, releasesFrom, reportsFrom, waitingFrom, type ReviewItem } from './review';

/** A pipeline run's log with only what the queue reads. */
const run = (ranAt: string, articles: LogArticle[], extra: Partial<RunLogData> = {}): RunLogData =>
  ({ kind: 'pipeline', ranAt, day: ranAt.slice(0, 10), seconds: 60, finished: true, feeds: [], articles, proofread: [], figures: [], model: { calls: 1, retries: {}, usage: {} }, ...extra }) as RunLogData;

const COWORKER = 'https://dev.to/neuraitool/salesforce-agentforce-coworker-a-50-ai-teammate-that-works-inside-teams-5201';
const article = (title: string, url: string, outcome: LogArticle['outcome'], reason?: string, score?: number): LogArticle => ({ title, url, source: 'dev.to', outcome, reason, score });

// Today's Coworker article, as the runs met it: held on 6 Nov, printed on 8 Nov, then made a line under the other telling.
const LOGS = [
  run('2026-11-08T06:31:31.901Z', [article('Agentforce Coworker Adds Teams and Mobile Access at $50 per User per Month', COWORKER, 'published', 'the same story as "Agentforce Coworker adds Teams, mobile and desktop access and a $50 per-user price", found by its headline; printed as a line under it', 6)]),
  run('2026-11-06T06:31:31.883Z', [article('Agentforce Coworker adds Teams and mobile access at $50 per user per month', `${COWORKER}?utm_source=rss`, 'held', 'the day had its 4 stories; held for a quieter day', 6)]),
];
const NOW = new Date('2026-11-08T12:00:00Z');

test("an article's whole life is put together from every run that met it, the earliest first, whatever its address's dressing", () => {
  const life = history(LOGS).get(COWORKER)!;
  assert.deepEqual(
    life.map((stage) => [stage.ranAt.slice(0, 10), stage.outcome, stage.score]),
    [
      ['2026-11-06', 'held', 6],
      ['2026-11-08', 'published', 6],
    ],
  );
  assert.equal(life[0].href, '/logs/#run-2026-11-06T06-31-31-883Z');
  assert.equal(life[0].label, 'Held for a quieter day');
});

test('a repeat found by its headline is flagged for a look, with its life, where it came from and where it is printed', () => {
  const printed = new Map([[COWORKER, '/2026-11-08/#07-sf-news-salesforce-s-agentforce-coworker-usage-soars-21x-in-three-mo']]);
  const [flag, ...rest] = flagsFrom(LOGS, printed, NOW);
  assert.equal(rest.length, 0, 'a held story is not a flag');
  assert.equal(flag.says, 'Made a line under "Agentforce Coworker adds Teams, mobile and desktop access and a $50 per-user price", by its headline alone and not by the editor. Check the two are the same story.');
  assert.deepEqual(
    flag.links.map((link) => link.label),
    ['Original', 'As printed', 'The run'],
  );
  assert.equal(flag.history?.length, 2);
});

test('what else a run did that needs a look: a story not proof-read, a refused change, a refused diagram, a failed picture, an unusable reply', () => {
  const log = run(
    '2026-11-07T06:00:00.000Z',
    [article('A', 'https://a.example/1', 'published'), article('B', 'https://a.example/2', 'published'), article('C', 'https://a.example/3', 'invalid-reply', 'not JSON')],
    {
      proofread: [
        { title: 'A', outcome: 'skipped', reason: 'the call limit was reached' },
        { title: 'B', outcome: 'kept', reason: 'a name was dropped' },
        { title: 'B', outcome: 'corrected' },
      ],
      figures: [
        { title: 'A', outcome: 'refused', reason: 'too few nodes' },
        { title: 'B', outcome: 'drawn', image: 'failed' },
      ],
    },
  );
  const says = flagsFrom([log], new Map(), NOW).map((flag) => [flag.title, flag.says.split(/[:.]/)[0]]);
  assert.deepEqual(says, [
    ['A', 'Printed without being proof-read'],
    ['B', "The proof-reader's change was refused, so it was printed as written"],
    ['A', 'Its diagram was refused'],
    ['B', 'Its illustration could not be drawn; the diagram stands alone'],
    ['C', "The model's reply could not be used"],
  ]);
  assert.equal(flagsFrom([log], new Map(), new Date('2026-12-01T00:00:00Z')).length, 0, 'runs older than the review window are not looked through');
});

test('a held story says when it was held and the last day it can wait to', () => {
  const [item] = heldFrom([{ name: '2026-11-06--07-dev-to-reconcile.md', data: { title: 'Reconciling record counts', url: 'https://dev.to/x', interest_score: 6, source: 'dev.to' }, body: '\nThe summary.\n' }], [], 3);
  assert.equal(item.id, 'held:2026-11-06--07-dev-to-reconcile.md');
  assert.match(item.says, /Held Fri 6 Nov, scored 6, from dev\.to\..*on Mon 9 Nov at the latest/);
  assert.equal(item.text, 'The summary.');
});

test('what waits: an article left for the next run that no later run judged, and a video waiting for its captions', () => {
  const logs = [
    run('2026-11-08T06:00:00.000Z', [article('Judged later', 'https://a.example/judged', 'published')]),
    run('2026-11-07T06:00:00.000Z', [article('Judged later', 'https://a.example/judged', 'deferred'), article('Still waiting', 'https://a.example/waiting', 'deferred', 'the call limit was reached')]),
  ];
  const items = waitingFrom(logs, { 'https://youtube.com/watch?v=1': { source: 'sf-dev-yt', since: '2026-11-05', why: 'no-transcript' } }, (id) => (id === 'sf-dev-yt' ? 'Salesforce Developers' : id), NOW);
  assert.deepEqual(
    items.map((item) => [item.title, item.says]),
    [
      ['Still waiting', 'Left for the next run: the call limit was reached.'],
      ['https://youtube.com/watch?v=1', 'From Salesforce Developers, waiting since Thu 5 Nov for its captions.'],
    ],
  );
});

test('a feed that fails again is a new item, so one dealt with comes back', () => {
  const sources = [{ id: 'ben', name: 'Salesforce Ben', url: 'https://www.salesforceben.com/feed/' }, { id: 'ok', name: 'Fine', url: 'https://ok.example/feed' }];
  const once = feedsFrom({ ben: { failures: 1, lastError: '503', lastSuccessAt: '2026-11-07T06:00:00Z' }, ok: { failures: 0 } }, sources);
  assert.deepEqual(
    once.map((item) => [item.id, item.says]),
    [['feed:ben:1', 'Failed its last run: 503. Last read in full Sat 7 Nov.']],
  );
  const done = markDone({}, once[0].id, true, NOW);
  assert.equal(queue(once, done, NOW).open.length, 0);
  const twice = feedsFrom({ ben: { failures: 2, lastError: '503' } }, sources);
  assert.equal(twice[0].id, 'feed:ben:2');
  assert.equal(queue(twice, done, NOW).open.length, 1, 'failing a second time brings it back');
});

test('a Known Issue is a candidate once it reaches the bar while young, and comes back when its status moves', () => {
  const watch = {
    // KI-77220 as recorded: filed 29 Oct, 246 affected by 4 Nov.
    'KI-77220': { key: 'a02x', subject: 'Reports fail to load', created: '2026-10-29', firstSeen: '2026-10-30', lastSeen: '2026-11-08', status: { '2026-10-30': 'In Review' }, affected: { '2026-10-30': 3, '2026-11-04': 246 } },
    'KI-1': { key: 'a', subject: 'Old and big', created: '2026-06-01', firstSeen: '2026-11-04', lastSeen: '2026-11-08', status: { '2026-11-04': 'In Review' }, affected: { '2026-11-04': 900 } },
    'KI-2': { key: 'b', subject: 'Young and small', created: '2026-11-06', firstSeen: '2026-11-06', lastSeen: '2026-11-08', status: { '2026-11-06': 'In Review' }, affected: { '2026-11-06': ISSUE_AFFECTED - 1 } },
  };
  const [item, ...rest] = issuesFrom(watch, '2026-11-08');
  assert.equal(rest.length, 0, 'an old issue reaching the bar, or a young one under it, is not printed');
  assert.equal(item.id, 'issue:KI-77220:In Review');
  assert.match(item.says, /246 affected, filed Thu 29 Oct \(3 on Fri 30 Oct, 246 on Wed 4 Nov\)/);
  assert.equal(item.links[0].href, 'https://help.salesforce.com/s/issue?id=a02x');
  const deployed = issuesFrom({ 'KI-77220': { ...watch['KI-77220'], status: { ...watch['KI-77220'].status, '2026-11-07': 'Solution Deployed' } } }, '2026-11-08');
  assert.equal(deployed[0].id, 'issue:KI-77220:Solution Deployed');
  assert.match(deployed[0].says, /^Solution deployed Sat 7 Nov/);
  assert.equal(issuesFrom({ 'KI-77220': { ...watch['KI-77220'], affected: { '2026-11-20': 246 } } }, '2026-11-20').length, 0, 'reaching the bar after its 14th day is too late');
  assert.equal(issuesFrom(watch, '2026-12-01').length, 0, 'four weeks after reaching the bar it is old news');
  assert.equal(issuesFrom({ 'KI-77220': { ...watch['KI-77220'], status: { '2026-11-28': 'Solution Deployed' } } }, '2026-12-01').length, 1, 'but a solution deployed since is news again');
});

test('releases: a check that failed, an edition just built, and a release about to start', () => {
  const items = releasesFrom(
    { at: '2026-11-08T06:32:12.153Z', outcome: 'could-not-ask', says: 'The notes answered 503.' },
    [
      { name: "Winter '27", slug: 'winter-27', builtAt: '2026-11-01T06:35:43.081Z', notesPublished: '2026-10-30T20:42:30.000Z', notes: 'https://help.example/notes' },
      { name: "Summer '26", slug: 'summer-26', builtAt: '2026-05-01T00:00:00.000Z' },
    ],
    [{ name: "Spring '27", stages: [{ place: 'sandboxes', from: '2026-11-20', to: '2026-11-20' }, { place: 'production', from: '2027-02-06', to: '2027-02-06' }] }],
    '2026-11-08',
    NOW,
  );
  assert.deepEqual(
    items.map((item) => item.title),
    ['The release notes did not answer', "Winter '27 release edition built", "Spring '27 reaches sandboxes Fri 20 Nov"],
  );
  assert.match(items[2].says, /^In 12 days/);
  assert.equal(releasesFrom({ at: NOW.toISOString(), outcome: 'nothing-owed' }, [], [], '2026-11-08', NOW).length, 0);
  const changed = releasesFrom(
    undefined,
    [
      {
        name: "Winter '27",
        slug: 'winter-27',
        builtAt: '2026-10-10T06:00:00.000Z',
        changes: [
          { at: '2026-10-01T06:00:00Z', added: ['x'], changed: [], removed: [], updates: [] },
          { at: '2026-11-07T06:00:00Z', added: ['a', 'b'], changed: ['c'], removed: [{ topic: 'd', name: 'D', area: 'Flow' }], updates: [{ topic: 't', name: 'Enforce TLS 1.3', kind: 'date', was: '1 Dec 2026', now: '2 Feb 2027' }] },
        ],
      },
    ],
    [],
    '2026-11-08',
    NOW,
  );
  assert.equal(changed.length, 1, 'a check older than the review window is not listed');
  assert.equal(changed[0].title, "The Winter '27 notes changed");
  assert.equal(changed[0].says, 'Checked Sat 7 Nov. Entries: 2 new, 1 changed, 1 printed feature gone. Enforce TLS 1.3: its day moved from 1 Dec 2026 to 2 Feb 2027.');
  assert.deepEqual(
    changed[0].links.map((link) => link.label),
    ['The edition', 'Deadlines'],
  );
});

test('reader reports not yet dealt with, with the story they are about', () => {
  const reports = [
    { id: 'r1', story: '2026-11-08/07-x', part: 'Summary' as const, note: 'The price is per user per month.', day: '2026-11-08', who: 'h', at: '2026-11-08T09:00:00Z' },
    { id: 'r2', story: '2026-11-08/07-x', part: 'Headline' as const, note: 'Fine now.', day: '2026-11-08', who: 'h', at: '2026-11-08T08:00:00Z' },
  ];
  const stories = new Map([['2026-11-08/07-x', { title: 'Coworker', href: '/2026-11-08/#07-x', url: 'https://example.com/x' }]]);
  const items = reportsFrom(reports, ['r2'], stories);
  assert.deepEqual(
    items.map((item) => [item.id, item.says, item.text]),
    [['report:r1', 'A reader says the summary is wrong.', 'The price is per user per month.']],
  );
});

test('the queue: open items newest first, and those done in the last week apart', () => {
  const item = (id: string, at: string): ReviewItem => ({ id, kind: 'held', title: id, says: '', at, links: [] });
  const items = [item('a', '2026-11-01'), item('b', '2026-11-07'), item('c', '2026-11-05'), item('d', '2026-11-02')];
  const done = { c: '2026-11-08T08:00:00.000Z', d: '2026-10-20T00:00:00.000Z' };
  const { open, done: dealt } = queue(items, done, NOW);
  assert.deepEqual(
    open.map((one) => one.id),
    ['b', 'a'],
  );
  assert.deepEqual(
    dealt.map((one) => [one.id, one.doneAt]),
    [['c', '2026-11-08T08:00:00.000Z']],
    'one done more than a week ago is no longer listed',
  );
  assert.deepEqual(markDone(done, 'c', false, NOW), { d: '2026-10-20T00:00:00.000Z' }, 'taken back');
});

test("the story a repeat went under is read from the run's reason", () => {
  assert.deepEqual(repeatOf('the same story as "A, B and C", printed on 2026-11-04, found by its headline; printed as a line under it'), { title: 'A, B and C', day: '2026-11-04' });
  assert.deepEqual(repeatOf('the same story as "X", which scored higher; printed as a line under it'), { title: 'X' });
  assert.equal(repeatOf('held for a quieter day'), undefined);
});

test('what was saved is read with care', () => {
  assert.deepEqual(readDone('{"a":"2026-11-08T00:00:00Z","b":5,"c":"soon"}'), { a: '2026-11-08T00:00:00Z' });
  assert.deepEqual(readDone('[1]'), {});
  assert.deepEqual(readDone('not json'), {});
});
