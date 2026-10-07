import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ago, allArticles, byDay, dollars, facts, findings, glance, spending, within, type RunFacts } from './insights';
import { legacyRuns, readLog, type RunLogData } from './logs';

const NOW = Date.parse('2026-10-04T12:00:00Z');

const log = readLog(
  JSON.stringify({
    kind: 'pipeline',
    ranAt: '2026-10-04T10:00:00Z',
    day: '2026-10-04',
    seconds: 600,
    finished: false,
    stopped: 'the cap of 40 model calls was reached',
    feeds: [{ id: 'a', name: 'A', items: 5 }, { id: 'b', name: 'B', items: 0, error: 'HTTP 500' }],
    articles: [
      { title: 'One', url: 'https://x/1', source: 'A', outcome: 'published', score: 8 },
      { title: 'Two', url: 'https://x/2', source: 'A', outcome: 'below-threshold', score: 5 },
      { title: 'Three', url: 'https://x/3', source: 'A', outcome: 'not-relevant', score: 2 },
      { title: 'Four', url: 'https://x/4', source: 'A', outcome: 'dropped', reason: 'too short' },
      { title: 'Five', url: 'https://x/5', source: 'A', outcome: 'deferred' },
      { title: 'Six', url: 'https://x/6', source: 'A', outcome: 'invalid-reply' },
    ],
    proofread: [{ title: 'One', outcome: 'corrected', reason: 'summary: 12 words differ' }, { title: 'x', outcome: 'skipped', reason: 'cap' }],
    figures: [{ title: 'One', outcome: 'drawn', kind: 'steps', image: 'failed' }, { title: 'y', outcome: 'refused' }, { title: 'z', outcome: 'none' }],
    model: { calls: 40, retries: { 'HTTP 429': 20, 'invalid reply': 4 }, usage: { m1: { input: 100, output: 200 }, m2: { input: 1, output: 2 } } },
  }),
) as RunLogData;

const run = (over: Partial<RunFacts>): RunFacts => ({ ...facts(readLog('{"ranAt":"2026-10-04T10:00:00Z"}') as RunLogData), ...over });

test('a run is reduced to the numbers the page reasons about', () => {
  const f = facts(log, 0.05);
  assert.deepEqual(
    [f.published, f.below, f.notRelevant, f.dropped, f.deferred, f.invalid, f.reviewed],
    [1, 1, 1, 1, 1, 1, 4],
    'reviewed is what the model answered for: not the dropped or the left over',
  );
  assert.deepEqual([f.calls, f.retries, f.rateLimited, f.tokens, f.cost], [40, 24, 20, 303, 0.05]);
  assert.deepEqual([f.feedsFailed, f.proofs, f.proofsDiscarded, f.figures, f.figuresRefused, f.picturesFailed], [1, 1, 1, 2, 1, 1]);
  assert.equal(f.totalsOnly, false);
  assert.equal(facts(log).cost, undefined);

  // A run from before logs were kept has its totals, and what its stats line says became of the articles.
  const [old] = legacyRuns('{"date":"2026-10-03","ranAt":"2026-10-03T08:00:00Z","fetched":24,"assessed":12,"published":3,"notRelevant":6,"belowThreshold":3,"prefiltered":2,"deferred":4,"llmCalls":21,"retries":{"HTTP 429":8}}', new Set());
  const o = facts(old);
  assert.deepEqual([o.totalsOnly, o.published, o.below, o.notRelevant, o.dropped, o.deferred, o.reviewed, o.retries], [true, 3, 3, 6, 2, 4, 12, 8]);
});

test('periods, spans of time and money read as a person would say them', () => {
  const runs = [run({ ranAt: '2026-10-04T10:00:00Z' }), run({ ranAt: '2026-09-20T10:00:00Z' })];
  assert.equal(within(runs, 7, NOW).length, 1);
  assert.equal(within(runs, 30, NOW).length, 2);
  assert.equal(within(runs, undefined, NOW).length, 2);
  assert.equal(ago('2026-10-04T11:59:30Z', NOW), 'just now');
  assert.equal(ago('2026-10-04T11:15:00Z', NOW), '45 minutes ago');
  assert.equal(ago('2026-10-04T02:00:00Z', NOW), '10 hours ago');
  assert.equal(ago('2026-10-01T12:00:00Z', NOW), '3 days ago');
  assert.deepEqual([ago('2026-10-04T11:15:00Z', NOW, true), ago('2026-10-04T02:00:00Z', NOW, true), ago('2026-10-01T12:00:00Z', NOW, true)], ['45 min ago', '10 h ago', '3 days ago']);
  assert.deepEqual([dollars(0), dollars(0.0747), dollars(0.0032), dollars(1.5)], ['$0.00', '$0.07', '$0.003', '$1.50']);
});

test('the figures at a glance add the runs up', () => {
  const g = glance([facts(log), run({ ranAt: '2026-10-03T10:00:00Z', published: 3, reviewed: 5, calls: 8, tokens: 1000 }), run({ kind: 'figures', calls: 2 })], NOW);
  assert.deepEqual(g.lastRun, { at: '2026-10-04T10:00:00Z', ago: '2 h ago', fine: false });
  assert.deepEqual([g.runs, g.published, g.reviewed, g.calls, g.retries, g.tokens], [2, 4, 9, 50, 24, 1303]);
  assert.equal(glance([], NOW).lastRun, undefined);
});

test('spending is this month only, with the pace for the whole month', () => {
  const s = spending(
    [
      { ranAt: '2026-10-01T05:00:00Z', cost: 0.1, spentTokens: true },
      { ranAt: '2026-10-04T05:00:00Z', cost: 0.3, spentTokens: true },
      { ranAt: '2026-10-04T06:00:00Z', spentTokens: true },
      { ranAt: '2026-10-04T07:00:00Z', spentTokens: false },
      { ranAt: '2026-09-30T05:00:00Z', cost: 5, spentTokens: true },
    ],
    2,
    new Date(NOW),
  );
  assert.equal(s.spent.toFixed(2), '0.40');
  // 40 cents in 4 days of a 31-day month.
  assert.equal(s.pace.toFixed(2), '3.10');
  assert.deepEqual([s.runs, s.costed, s.budget], [3, 2, 2]);
  // A run late on 30 September by the clock in London is already in October in Kolkata.
  const late = [{ ranAt: '2026-09-30T20:00:00Z', cost: 1, spentTokens: true }];
  assert.equal(spending(late, undefined, new Date(NOW), 'UTC').spent, 0);
  assert.equal(spending(late, undefined, new Date(NOW), 'Asia/Kolkata').spent, 1);
  assert.equal(spending([], undefined, new Date(NOW)).budget, undefined);
});

// What the page shows as it stands; findings held back until they become true are left out.
const says = (found: ReturnType<typeof findings>) => found.filter((f) => !f.hidden).map((f) => `${f.tone}: ${f.says}`).join('\n');
const quiet = { stale: [], failingFeeds: [], sourcesToLook: [], now: NOW };

test('a healthy paper says what is fine, so a short list is not mistaken for nothing checked', () => {
  const good = run({ published: 8, reviewed: 10, calls: 20, retries: 1, proofs: 8, figures: 2 });
  const found = findings({ ...quiet, runs: [good], latest: good, spending: { spent: 0.4, pace: 1.2, runs: 4, costed: 4, budget: 2 } });
  const shown = found.filter((f) => !f.hidden);
  assert.equal(shown.length, 1);
  assert.equal(shown[0].tone, 'fine');
  assert.match(shown[0].says, /^Every feed answered, few repeated calls, no trouble with unusable replies, no source needs a look, spending is within budget \(\$0\.40 of \$2\.00\)\.$/);
  // The page says the run was recent for as long as that is so, and holds "has not run lately" ready for when it is not.
  assert.equal(shown[0].lastRunAt, '2026-10-04T10:00:00Z');
  assert.deepEqual(found.filter((f) => f.hidden).map((f) => [f.says, f.lastRunAt]), [['The pipeline last ran 2 hours ago.', '2026-10-04T10:00:00Z']]);
});

test('each finding has its rule, and problems come before things to watch', () => {
  const bad = facts(log);
  const found = findings({
    runs: [bad, run({ reviewed: 16, published: 1, calls: 0 })],
    latest: bad,
    stale: [{ day: '2026-10-04', onDisk: 21, served: 19 }],
    failingFeeds: [{ name: 'Feed B', failures: 3 }],
    sourcesToLook: ['Source A', 'Source B'],
    spending: { spent: 1.7, pace: 2.6, runs: 3, costed: 3, budget: 2 },
    maxCalls: 60,
    now: NOW,
  });
  const text = says(found);
  for (const expected of [
    /problem: The site is out of date: it shows 19 of 21 stories and briefs for 2026-10-04\./,
    /problem: The last run stopped early: the cap of 40 model calls was reached\./,
    /problem: Feed B has failed 3 runs in a row\./,
  ]) assert.match(text, expected);
  assert.match(text, /watch: 1 article was left for the next run\./);
  assert.match(text, /watch: 24 of 40 model calls \(60%\) were repeats, 20 of them for rate limits\./);
  assert.match(text, /watch: 1 illustration could not be made\./);
  assert.match(text, /watch: Only 2 of 20 articles reviewed \(10%\) were published\./);
  assert.match(text, /watch: 2 sources need a look: Source A, Source B\./);
  assert.match(text, /watch: This month has cost \$1\.70 and is on pace for \$2\.60, against a budget of \$2\.00\./);
  assert.doesNotMatch(text, /reviews .* came back unusable/, '1 unusable reply in 20 is under the bar');
  assert.equal(found.find((f) => /left for the next run/.test(f.says))?.action, 'If this keeps happening, raise the limit on model calls for a run, now 60 (the setting LLM_MAX_CALLS).');

  const tones = found.map((f) => f.tone);
  assert.deepEqual(tones, [...tones].sort((a, b) => ['problem', 'watch', 'fine'].indexOf(a) - ['problem', 'watch', 'fine'].indexOf(b)));
});

test('a feed that failed in the last run is said so, and is not called answered', () => {
  const failed = run({ feedsFailed: 2 });
  const text = says(findings({ ...quiet, runs: [failed], latest: failed }));
  assert.match(text, /watch: 2 feeds failed in the last run\./);
  assert.doesNotMatch(text, /every feed answered/i);
  // Once a feed is failing in its own right, that finding says it.
  const known = says(findings({ ...quiet, runs: [failed], latest: run({ feedsFailed: 1 }), failingFeeds: [{ name: 'Feed B', failures: 3 }] }));
  assert.doesNotMatch(known, /failed in the last run/);
});

test('rules that need enough to go on stay quiet until they have it', () => {
  // Three calls, two of them repeats: too few to call it a pattern.
  const few = run({ calls: 3, retries: 2, reviewed: 2, invalid: 1, proofs: 2, proofsDiscarded: 2, figures: 1, figuresRefused: 1 });
  assert.equal(findings({ ...quiet, runs: [few], latest: few }).filter((f) => f.tone !== 'fine' && !f.hidden).length, 0);

  const many = run({ calls: 12, retries: 4, reviewed: 10, invalid: 2, proofs: 6, proofsDiscarded: 2, figures: 4, figuresRefused: 2 });
  const text = says(findings({ ...quiet, runs: [many], latest: many }));
  assert.match(text, /problem: 2 of 10 reviews \(20%\) came back unusable\./);
  assert.match(text, /watch: 4 of 12 model calls \(33%\) were repeats\./);
  assert.match(text, /watch: 2 of 6 proof-reads \(33%\) were partly thrown away\./);
  assert.match(text, /watch: 2 of 4 diagrams \(50%\) were refused\./);

  // No run at all, an old run, and money past the budget.
  assert.match(says(findings({ ...quiet, runs: [] })), /watch: No run of the pipeline is recorded\./);
  const old = run({ ranAt: '2026-10-01T12:00:00Z' });
  assert.match(says(findings({ ...quiet, runs: [], latest: old })), /watch: The pipeline last ran 3 days ago\./);
  assert.match(says(findings({ ...quiet, runs: [], latest: run({}), spending: { spent: 2.5, pace: 9, runs: 2, costed: 2, budget: 2 } })), /problem: This month has cost \$2\.50, over the budget of \$2\.00\./);
  // Without a budget, or with no cost recorded, money is not judged.
  assert.doesNotMatch(says(findings({ ...quiet, runs: [], latest: run({}), spending: { spent: 9, pace: 90, runs: 2, costed: 2 } })), /budget/);
  assert.doesNotMatch(says(findings({ ...quiet, runs: [], latest: run({}), spending: { spent: 0, pace: 0, runs: 2, costed: 0, budget: 2 } })), /budget/);
});

test('every article of every run is in one list, with its run', () => {
  const rows = allArticles([log, readLog('{"ranAt":"2026-10-03T10:00:00Z","day":"2026-10-03","articles":[{"title":"Old","url":"https://x/9","source":"B","outcome":"published"}]}') as RunLogData]);
  assert.equal(rows.length, 7);
  assert.deepEqual([rows[0].title, rows[0].ranAt, rows[6].title, rows[6].day], ['One', '2026-10-04T10:00:00Z', 'Old', '2026-10-03']);
});

test('runs are added up by day for the charts, and empty days are left out', () => {
  const days = byDay([
    facts(log),
    run({ ranAt: '2026-10-04T18:00:00Z', published: 2, calls: 5, retries: 1 }),
    run({ ranAt: '2026-10-03T09:00:00Z', kind: 'figures', calls: 1 }),
    run({ ranAt: '2026-10-02T09:00:00Z' }),
  ]);
  assert.deepEqual(days, [
    { day: '2026-10-03', published: 0, below: 0, notRelevant: 0, lost: 0, calls: 1, retries: 0 },
    { day: '2026-10-04', published: 3, below: 1, notRelevant: 1, lost: 3, calls: 45, retries: 25 },
  ]);
});

test('videos judged without their transcripts are said so, and a video waiting for one is not a run cut short', () => {
  const log = readLog(
    JSON.stringify({
      ranAt: '2026-10-06T10:00:00Z',
      transcriptsDown: 'Sign in to confirm you are not a bot',
      articles: [
        { title: 'A', url: 'https://y/a', source: 'Channel', outcome: 'published', basis: 'description' },
        { title: 'B', url: 'https://y/b', source: 'Channel', outcome: 'deferred', awaiting: 'transcript' },
        { title: 'C', url: 'https://y/c', source: 'Blog', outcome: 'deferred' },
      ],
    }),
  ) as RunLogData;
  const f = facts(log);
  assert.deepEqual([f.deferred, f.awaitingTranscript, f.videosHeard, f.videosDescribed, f.transcriptsDown], [1, 1, 0, 1, 'Sign in to confirm you are not a bot']);

  const says = (latest: RunFacts, runs = [latest]) => findings({ runs, latest, stale: [], failingFeeds: [], sourcesToLook: [], now: Date.parse('2026-10-06T11:00:00Z') }).map((finding) => finding.says).join(' | ');
  assert.match(says(f), /No video transcript could be fetched in the last run \(Sign in to confirm you are not a bot\)/);
  const at = { ranAt: '2026-10-06T10:00:00Z' };
  assert.match(says(run({ ...at, videosHeard: 1, videosDescribed: 3 })), /3 of 4 videos \(75%\) were judged on their description alone/);
  assert.doesNotMatch(says(run({ ...at, videosHeard: 1, videosDescribed: 1 })), /description alone/, 'too few videos to say');
  assert.match(says(run({ ...at, videosHeard: 3, videosDescribed: 1 })), /videos were judged on their transcripts/i);
});

test('a finding that comes from a run names the newest run where it happened', () => {
  const runs = [run({ ranAt: '2026-10-06T10:00:00Z' }), run({ ranAt: '2026-10-05T10:00:00Z', picturesFailed: 1 }), run({ ranAt: '2026-10-04T10:00:00Z', picturesFailed: 2 })];
  const found = findings({ runs, latest: runs[0], stale: [], failingFeeds: [], sourcesToLook: [], now: Date.parse('2026-10-06T11:00:00Z') });
  const pictures = found.find((finding) => finding.says.includes('illustrations could not be made'));
  assert.equal(pictures?.run, '2026-10-05T10:00:00Z');
  assert.doesNotMatch(pictures?.action ?? '', /npm|LLM_/, 'the advice is in plain words');

  const stopped = run({ ranAt: '2026-10-06T10:00:00Z', finished: false, stopped: 'the call cap' });
  assert.equal(findings({ runs: [stopped], latest: stopped, stale: [], failingFeeds: [], sourcesToLook: [] }).find((finding) => finding.tone === 'problem')?.run, '2026-10-06T10:00:00Z');
});

test('something read from outside that fails is said so, and is a problem once it keeps failing', () => {
  const price = (ok: boolean) => ({ name: 'The share price', ok, ...(ok ? {} : { says: 'HTTP 429' }) });
  const dates = { name: 'Release dates', ok: true };
  const bad = (ranAt: string) => run({ ranAt, checks: [dates, price(false)] });
  const once = says(findings({ ...quiet, runs: [bad('2026-10-04T10:00:00Z'), run({ ranAt: '2026-10-03T10:00:00Z', checks: [dates, price(true)] })], latest: bad('2026-10-04T10:00:00Z') }));
  assert.match(once, /watch: The share price could not be read in the last run \(HTTP 429\)\./);
  const thrice = [bad('2026-10-04T10:00:00Z'), bad('2026-10-03T10:00:00Z'), bad('2026-10-02T10:00:00Z')];
  assert.match(says(findings({ ...quiet, runs: thrice, latest: thrice[0] })), /problem: The share price could not be read in the last 3 runs/);
  const fine = run({ checks: [dates, price(true)] });
  assert.match(says(findings({ ...quiet, runs: [fine], latest: fine })), /release dates and the share price were read/i);
  // No advice on the page is a command to type.
  const all = findings({ ...quiet, runs: thrice, latest: thrice[0], stale: [{ day: '4 Oct', onDisk: 3, served: 1 }], failingFeeds: [{ name: 'Feed B', failures: 3 }], release: { at: '2026-10-04T09:00:00Z', outcome: 'failed', says: 'HTTP 403' } });
  for (const finding of [...all, ...findings({ ...quiet, runs: [] })]) assert.doesNotMatch(finding.action ?? '', /npm |npx /);
});

test('how the release edition step went is said: a failure to watch, a build or nothing owed as fine', () => {
  const good = run({});
  const at = '2026-10-04T09:00:00Z';
  const of = (release: Parameters<typeof findings>[0]['release']) => says(findings({ ...quiet, runs: [good], latest: good, release, now: Date.parse('2026-10-04T12:00:00Z') }));
  assert.match(of({ at, outcome: 'failed', says: 'HTTP 403' }), /watch: The release edition could not be built .*\(HTTP 403\)\./);
  assert.match(of({ at, outcome: 'could-not-ask', says: 'timeout' }), /watch: The release notes could not be asked/);
  assert.match(of({ at, outcome: 'built', says: "Winter '27, 188 features" }), /the release edition was built/i);
  assert.match(of({ at, outcome: 'nothing-owed' }), /no release edition is owed/i);
  assert.doesNotMatch(of(undefined), /release edition/i);
});
