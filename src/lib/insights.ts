// What the runs add up to, and what to make of it. The Logs page is for whoever
// runs the paper; this turns its records into figures and plain findings.
// Pure functions, so every rule here can be tested.

import type { ArticleOutcome, LogArticle, RunLogData } from './logs';

/** One run, reduced to the numbers the page reasons about. */
export interface RunFacts {
  kind: 'pipeline' | 'figures';
  ranAt: string;
  day: string;
  finished: boolean;
  stopped?: string;
  seconds: number;
  /** True when only totals are known, as for a run from before logs were kept. */
  totalsOnly: boolean;
  published: number;
  below: number;
  notRelevant: number;
  /** Turned away before review. */
  dropped: number;
  /** Left for the next run because the run stopped or ran out of calls. */
  deferred: number;
  /** Videos left for the next run because their transcript had not come. */
  awaitingTranscript: number;
  /** Videos read from their transcript, and from their description alone. */
  videosHeard: number;
  videosDescribed: number;
  /** Why no transcript could be fetched in this run, when none could. */
  transcriptsDown?: string;
  invalid: number;
  reviewed: number;
  calls: number;
  /** Calls that had to be made again, whatever the cause. */
  retries: number;
  /** Of those, the ones caused by a rate limit. */
  rateLimited: number;
  tokens: number;
  cost?: number;
  feedsFailed: number;
  proofs: number;
  proofsDiscarded: number;
  figures: number;
  figuresRefused: number;
  picturesFailed: number;
}

const outcomeCount = (log: RunLogData, outcome: ArticleOutcome) => log.articles.filter((article) => article.outcome === outcome).length;

/** A run's log as facts. `cost` is what its stats line recorded, when it recorded one. */
export function facts(log: RunLogData, cost?: number): RunFacts {
  const retries = Object.values(log.model.retries).reduce((sum, n) => sum + n, 0);
  const totalsOnly = log.totals !== undefined;
  const published = log.totals?.published ?? outcomeCount(log, 'published');
  const below = log.outcomes?.below ?? outcomeCount(log, 'below-threshold');
  const notRelevant = log.outcomes?.notRelevant ?? outcomeCount(log, 'not-relevant');
  const invalid = log.outcomes?.invalid ?? outcomeCount(log, 'invalid-reply');
  return {
    kind: log.kind,
    ranAt: log.ranAt,
    day: log.day,
    finished: log.finished,
    stopped: log.stopped,
    seconds: log.seconds,
    totalsOnly,
    published,
    below,
    notRelevant,
    dropped: log.outcomes?.dropped ?? outcomeCount(log, 'dropped'),
    deferred: log.outcomes?.deferred ?? log.articles.filter((article) => article.outcome === 'deferred' && !article.awaiting).length,
    awaitingTranscript: log.articles.filter((article) => article.awaiting === 'transcript').length,
    videosHeard: log.articles.filter((article) => article.basis === 'transcript').length,
    videosDescribed: log.articles.filter((article) => article.basis === 'description').length,
    ...(log.transcriptsDown ? { transcriptsDown: log.transcriptsDown } : {}),
    invalid,
    reviewed: log.totals?.reviewed ?? published + below + notRelevant + invalid,
    calls: log.model.calls,
    retries,
    rateLimited: log.model.retries['HTTP 429'] ?? 0,
    tokens: Object.values(log.model.usage).reduce((sum, spent) => sum + spent.input + spent.output, 0),
    ...(cost !== undefined ? { cost } : {}),
    feedsFailed: log.feeds.filter((feed) => feed.error).length,
    proofs: log.proofread.filter((proof) => proof.outcome !== 'skipped').length,
    proofsDiscarded: log.proofread.filter((proof) => proof.outcome !== 'skipped' && proof.reason).length,
    figures: log.figures.filter((figure) => figure.outcome === 'drawn' || figure.outcome === 'refused').length,
    figuresRefused: log.figures.filter((figure) => figure.outcome === 'refused').length,
    picturesFailed: log.figures.filter((figure) => figure.image === 'failed').length,
  };
}

/** The runs that started in the last `days` days. All of them when `days` is not given. */
export function within(runs: RunFacts[], days: number | undefined, now = Date.now()): RunFacts[] {
  if (!days) return runs;
  const from = now - days * 86_400_000;
  return runs.filter((run) => Date.parse(run.ranAt) >= from);
}

/** A stretch of time in words: "just now", "2 hours ago", "3 days ago". With `short`, "32 min ago" and "2 h ago", for a figure with little room. */
export function ago(iso: string, now = Date.now(), short = false): string {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (minutes < 2) return 'just now';
  if (minutes < 90) return `${minutes} ${short ? 'min' : 'minutes'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 36) return `${hours} ${short ? 'h' : 'hours'} ago`;
  return `${Math.round(hours / 24)} days ago`;
}

/** What has been spent this month, and what the month will come to at this rate. */
export interface Spending {
  /** US dollars recorded so far this month. */
  spent: number;
  /** The same rate carried to the end of the month. */
  pace: number;
  /** Runs this month that used tokens, and how many of them recorded their cost. */
  runs: number;
  costed: number;
  budget?: number;
}

/** A moment as a date ("2026-10-04") in a time zone. */
const dateIn = (at: Date, timeZone: string) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);

/**
 * What this month has cost. A run belongs to the month in which it ran, in the
 * paper's time zone, whichever edition it wrote into.
 */
export function spending(runs: { ranAt: string; cost?: number; spentTokens: boolean }[], budget: number | undefined, now = new Date(), timeZone = 'UTC'): Spending {
  const today = dateIn(now, timeZone);
  const month = today.slice(0, 7);
  const mine = runs.filter((run) => run.spentTokens && dateIn(new Date(run.ranAt), timeZone).slice(0, 7) === month);
  const spent = mine.reduce((sum, run) => sum + (run.cost ?? 0), 0);
  const daysInMonth = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0)).getUTCDate();
  return { spent, pace: (spent / Number(today.slice(8))) * daysInMonth, runs: mine.length, costed: mine.filter((run) => run.cost !== undefined).length, ...(budget ? { budget } : {}) };
}

/** $0.0747 as "$0.07"; under a cent, the first figure that is not nought. */
export const dollars = (usd: number) => (usd === 0 ? '$0.00' : `$${usd >= 0.01 ? usd.toFixed(2) : usd.toPrecision(1)}`);

export interface Glance {
  /** `ago` is the short form, for the figure; `at` is when it ran. */
  lastRun?: { at: string; ago: string; fine: boolean };
  runs: number;
  published: number;
  reviewed: number;
  calls: number;
  retries: number;
  tokens: number;
}

/** The headline figures for a set of runs, newest first. */
export function glance(runs: RunFacts[], now = Date.now()): Glance {
  const pipeline = runs.filter((run) => run.kind === 'pipeline');
  const last = pipeline[0];
  const sum = (pick: (run: RunFacts) => number) => runs.reduce((total, run) => total + pick(run), 0);
  return {
    ...(last ? { lastRun: { at: last.ranAt, ago: ago(last.ranAt, now, true), fine: last.finished && last.feedsFailed === 0 && last.invalid === 0 } } : {}),
    runs: pipeline.length,
    published: sum((run) => run.published),
    reviewed: sum((run) => run.reviewed),
    calls: sum((run) => run.calls),
    retries: sum((run) => run.retries),
    tokens: sum((run) => run.tokens),
  };
}

/** A day's runs added together, for the charts. */
export interface DayFacts {
  day: string;
  published: number;
  below: number;
  notRelevant: number;
  /** Dropped before review, left for the next run, or lost to an unusable reply. */
  lost: number;
  calls: number;
  retries: number;
}

/** The runs added up by the day they ran, oldest first. A day on which nothing happened is left out. */
export function byDay(runs: RunFacts[]): DayFacts[] {
  const days = new Map<string, DayFacts>();
  for (const run of runs) {
    const day = run.ranAt.slice(0, 10);
    const sum = days.get(day) ?? { day, published: 0, below: 0, notRelevant: 0, lost: 0, calls: 0, retries: 0 };
    sum.published += run.published;
    sum.below += run.below;
    sum.notRelevant += run.notRelevant;
    sum.lost += run.dropped + run.deferred + run.awaitingTranscript + run.invalid;
    sum.calls += run.calls;
    sum.retries += run.retries;
    days.set(day, sum);
  }
  return [...days.values()].filter((d) => d.published + d.below + d.notRelevant + d.lost + d.calls > 0).sort((a, b) => a.day.localeCompare(b.day));
}

// The thresholds, in one place so they can be tuned.
export const RULES = {
  /** Hours without a pipeline run before the page says so. */
  staleHours: 36,
  /** Share of calls that were retries, and the calls needed before that is judged. */
  retries: { share: 0.25, calls: 10 },
  /** Share of reviews that came back unusable. */
  invalid: { share: 0.1, reviewed: 5 },
  /** Share of proof-reads thrown away. */
  proofs: { share: 0.3, proofs: 5 },
  /** Share of diagrams refused. */
  figures: { share: 0.3, figures: 3 },
  /** Share of reviewed articles published, below which the paper is finding little. */
  lowYield: { share: 0.2, reviewed: 15 },
  /** Share of videos judged on a description alone above which it is said, and the videos needed before it is judged. */
  videos: { share: 0.5, videos: 4 },
  /** Share of the monthly budget at which spending is worth a warning. */
  budget: 0.8,
};

export type Tone = 'problem' | 'watch' | 'fine';

export interface Finding {
  tone: Tone;
  /** What was found, as a sentence. */
  says: string;
  /** What to do about it. */
  action?: string;
  /** Where on the page the detail is. */
  href?: string;
  /**
   * When the last run was, on the two findings that depend on how long ago
   * that is. A page built once and read later decides them again as it loads:
   * the "has not run lately" finding carries `hidden` until it is true, and the
   * line of what is fine says the run was recent only while it is.
   */
  lastRunAt?: string;
  hidden?: boolean;
  /** The `ranAt` of the run to look at, when the finding comes from particular runs. */
  run?: string;
}

export interface FindingsInput {
  /** The runs of the period, newest first. */
  runs: RunFacts[];
  /** The newest pipeline run of all, whatever the period. */
  latest?: RunFacts;
  /** Editions where the site shows fewer stories than are on disk. */
  stale: { day: string; onDisk: number; served: number }[];
  /** Feeds that have failed several runs in a row, by name. */
  failingFeeds: { name: string; failures: number }[];
  /** Sources the scorecard says need a look, by name. */
  sourcesToLook: string[];
  spending?: Spending;
  /** The call cap in force, for the advice on raising it. */
  maxCalls?: number;
  now?: number;
}

const percent = (part: number, whole: number) => `${Math.round((part / whole) * 100)}%`;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * What the records say, most pressing first: problems, then things to watch,
 * then what is fine, so that a short list is never mistaken for nothing checked.
 */
export function findings(input: FindingsInput): Finding[] {
  const { runs, latest, now = Date.now() } = input;
  const found: Finding[] = [];
  const fine: string[] = [];
  const sum = (pick: (run: RunFacts) => number) => runs.reduce((total, run) => total + pick(run), 0);
  /** The newest run of the period in which it happened, to send the reader to. */
  const where = (pick: (run: RunFacts) => number) => {
    const run = runs.find((candidate) => pick(candidate) > 0)?.ranAt;
    return run ? { run } : {};
  };

  for (const edition of input.stale) {
    found.push({ tone: 'problem', says: `The site is out of date: it shows ${edition.served} of ${edition.onDisk} stories and briefs for ${edition.day}.`, action: 'Restart the dev server (npx astro dev stop, then npm run dev).' });
  }

  if (!latest) {
    found.push({ tone: 'watch', says: 'No run of the pipeline is recorded.', action: 'Run npm run pipeline.' });
  } else {
    const stale = (now - Date.parse(latest.ranAt)) / 3_600_000 > RULES.staleHours;
    found.push({ tone: 'watch', says: `The pipeline last ran ${ago(latest.ranAt, now)}.`, action: 'Run npm run pipeline, or check the schedule.', lastRunAt: latest.ranAt, hidden: !stale });
    if (!latest.finished) found.push({ tone: 'problem', says: `The last run stopped early${latest.stopped ? `: ${latest.stopped}` : ''}.`, action: 'What it left is picked up by the next run.', href: '#runs', run: latest.ranAt });
    if (latest.deferred > 0) {
      found.push({
        tone: 'watch',
        says: `${plural(latest.deferred, 'article was', 'articles were')} left for the next run.`,
        action: `If this keeps happening, raise LLM_MAX_CALLS${input.maxCalls ? ` (now ${input.maxCalls})` : ''}.`,
        href: '#articles',
      });
    }
  }

  // Videos are meant to be judged on what is said in them. The way to transcripts is unofficial and can shut.
  const heard = sum((run) => run.videosHeard);
  const described = sum((run) => run.videosDescribed);
  if (latest?.transcriptsDown) {
    found.push({
      tone: 'watch',
      says: `No video transcript could be fetched in the last run (${latest.transcriptsDown}), so its videos were judged on their descriptions.`,
      action: 'Once is often passing. If every run says this, YouTube is refusing the machine the pipeline runs on.',
      href: '#articles',
    });
  } else if (heard + described >= RULES.videos.videos && described / (heard + described) > RULES.videos.share) {
    found.push({
      tone: 'watch',
      says: `${described} of ${heard + described} videos (${percent(described, heard + described)}) were judged on their description alone.`,
      action: 'Their transcripts could not be had. A description says little of a video, so these verdicts are weaker.',
      href: '#articles',
    });
  } else if (heard > 0) fine.push('videos were judged on their transcripts');

  for (const feed of input.failingFeeds) {
    found.push({ tone: 'problem', says: `${feed.name} has failed ${feed.failures} runs in a row.`, action: 'Check its address in paper.config.ts.', href: '#sources' });
  }
  // A feed that failed in the last run is said so, short of the several runs in a row that make it failing.
  const justFailed = latest?.feedsFailed ?? 0;
  if (justFailed > input.failingFeeds.length) {
    found.push({ tone: 'watch', says: `${plural(justFailed, 'feed', 'feeds')} failed in the last run.`, action: 'One failure is often passing. It is flagged as failing after three runs in a row.', href: '#runs', run: latest!.ranAt });
  } else if (input.failingFeeds.length === 0) fine.push('every feed answered');

  const calls = sum((run) => run.calls);
  const retries = sum((run) => run.retries);
  if (calls >= RULES.retries.calls && retries / calls >= RULES.retries.share) {
    const limited = sum((run) => run.rateLimited);
    found.push({
      tone: 'watch',
      says: `${retries} of ${calls} model calls (${percent(retries, calls)}) were repeats${limited ? `, ${limited} of them for rate limits` : ''}.`,
      action: limited * 2 >= retries ? 'Put a paid model first in LLM_MODELS, or raise LLM_MIN_INTERVAL_MS.' : 'See which model is failing under Runs.',
      href: '#runs',
      ...where((run) => run.retries),
    });
  } else if (calls > 0) fine.push('few repeated calls');

  const reviewed = sum((run) => run.reviewed);
  const invalid = sum((run) => run.invalid);
  if (reviewed >= RULES.invalid.reviewed && invalid / reviewed >= RULES.invalid.share) {
    found.push({ tone: 'problem', says: `${invalid} of ${reviewed} reviews (${percent(invalid, reviewed)}) came back unusable.`, action: 'The model is not following the reply format. Try another.', href: '#articles' });
  } else if (reviewed > 0) fine.push('no trouble with unusable replies');

  const proofs = sum((run) => run.proofs);
  const discarded = sum((run) => run.proofsDiscarded);
  if (proofs >= RULES.proofs.proofs && discarded / proofs >= RULES.proofs.share) {
    found.push({ tone: 'watch', says: `${discarded} of ${proofs} proof-reads (${percent(discarded, proofs)}) were partly thrown away.`, action: 'The model rewrites where it should only correct. Try another.', href: '#runs', ...where((run) => run.proofsDiscarded) });
  }

  const figures = sum((run) => run.figures);
  const refused = sum((run) => run.figuresRefused);
  if (figures >= RULES.figures.figures && refused / figures >= RULES.figures.share) {
    found.push({ tone: 'watch', says: `${refused} of ${figures} diagrams (${percent(refused, figures)}) were refused.`, action: 'They stated something the article did not, or were the wrong shape.', href: '#runs', ...where((run) => run.figuresRefused) });
  }
  const pictures = sum((run) => run.picturesFailed);
  if (pictures > 0) found.push({ tone: 'watch', says: `${plural(pictures, 'illustration', 'illustrations')} could not be made.`, action: 'The run says why. If the story now has its picture, a later run drew it and nothing needs doing.', href: '#runs', ...where((run) => run.picturesFailed) });

  const published = sum((run) => run.published);
  if (reviewed >= RULES.lowYield.reviewed && published / reviewed < RULES.lowYield.share) {
    found.push({ tone: 'watch', says: `Only ${published} of ${reviewed} articles reviewed (${percent(published, reviewed)}) were published.`, action: 'The sources, or the wording of "relevant" in paper.config.ts, need a look.', href: '#sources' });
  }

  if (input.sourcesToLook.length) {
    found.push({ tone: 'watch', says: `${plural(input.sourcesToLook.length, 'source needs', 'sources need')} a look: ${input.sourcesToLook.join(', ')}.`, action: 'See what the scorecard says of each.', href: '#sources' });
  } else fine.push('no source needs a look');

  const money = input.spending;
  if (money?.budget && money.costed > 0) {
    const over = money.spent >= money.budget;
    if (over || money.spent >= money.budget * RULES.budget || money.pace > money.budget) {
      found.push({
        tone: over ? 'problem' : 'watch',
        says: over
          ? `This month has cost ${dollars(money.spent)}, over the budget of ${dollars(money.budget)}.`
          : `This month has cost ${dollars(money.spent)} and is on pace for ${dollars(money.pace)}, against a budget of ${dollars(money.budget)}.`,
        action: 'Use a cheaper model, lower LLM_MAX_CALLS, or set LLM_MAX_COST_USD for each run.',
      });
    } else fine.push(`spending is within budget (${dollars(money.spent)} of ${dollars(money.budget)})`);
  }

  const order: Tone[] = ['problem', 'watch'];
  found.sort((a, b) => order.indexOf(a.tone) - order.indexOf(b.tone));
  if (fine.length) found.push({ tone: 'fine', says: `${fine.join(', ').replace(/^./, (first) => first.toUpperCase())}.`, ...(latest ? { lastRunAt: latest.ranAt } : {}) });
  return found;
}

/** An article, with the run it was handled in. */
export interface ArticleRow extends LogArticle {
  ranAt: string;
  day: string;
}

/** Every article of every run that kept its articles, newest run first. */
export function allArticles(logs: RunLogData[]): ArticleRow[] {
  return logs.flatMap((log) => log.articles.map((article) => ({ ...article, ranAt: log.ranAt, day: log.day })));
}
