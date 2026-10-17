// How each source is doing, worked out from what the runs recorded about it.
// Pure functions: the command and the Logs page read the files, this judges them.

/** What one run recorded about one source. */
export interface SourceTally {
  /** Items the feed offered in the span the run read. */
  items: number;
  /** Of those, the ones no earlier run had handled. */
  new: number;
  /** Turned away before review: too short, not in English, off topic. */
  dropped: number;
  /** Not reviewed because the article's page could not be read. */
  unread: number;
  reviewed: number;
  published: number;
  below: number;
  notRelevant: number;
  /** The interest score of each article reviewed. */
  scores: number[];
  /** Tokens spent reviewing and proof-reading its articles. */
  tokens: number;
}

export const emptyTally = (): SourceTally => ({ items: 0, new: 0, dropped: 0, unread: 0, reviewed: 0, published: 0, below: 0, notRelevant: 0, scores: [], tokens: 0 });

const count = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

/** A run's record of its sources, with anything missing or misshapen counted as nothing. */
export function readTallies(raw: unknown): Record<string, SourceTally> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const tallies: Record<string, SourceTally> = {};
  for (const [id, value] of Object.entries(raw as Record<string, Record<string, unknown>>)) {
    if (!value || typeof value !== 'object') continue;
    tallies[id] = {
      items: count(value.items),
      new: count(value.new),
      dropped: count(value.dropped),
      unread: count(value.unread),
      reviewed: count(value.reviewed),
      published: count(value.published),
      below: count(value.below),
      notRelevant: count(value.notRelevant),
      scores: Array.isArray(value.scores) ? value.scores.filter((score): score is number => typeof score === 'number') : [],
      tokens: count(value.tokens),
    };
  }
  return tallies;
}

/** Several runs' records of each source, added together. */
export function addTallies(runs: Record<string, SourceTally>[]): Record<string, SourceTally> {
  const total: Record<string, SourceTally> = {};
  for (const run of runs) {
    for (const [id, tally] of Object.entries(run)) {
      const sum = (total[id] ??= emptyTally());
      // The same items are offered again by the next run's look-back, so only the new ones are added up.
      sum.items += tally.new;
      sum.new += tally.new;
      sum.dropped += tally.dropped;
      sum.unread += tally.unread;
      sum.reviewed += tally.reviewed;
      sum.published += tally.published;
      sum.below += tally.below;
      sum.notRelevant += tally.notRelevant;
      sum.scores.push(...tally.scores);
      sum.tokens += tally.tokens;
    }
  }
  return total;
}

/** What is known about a feed itself, from data/sources.json. */
export interface FeedState {
  failures?: number;
  /** When its newest post was published, as last seen. */
  lastPostAt?: string;
}

export type Standing = 'failing' | 'unreadable' | 'quiet' | 'low' | 'strong' | 'keep' | 'new';

export interface Verdict {
  standing: Standing;
  /** In words, for the table: "Quiet for 11 months". */
  says: string;
  /** Worth a person's attention. */
  look: boolean;
}

// The rules, in one place so they can be tuned.
export const RULES = {
  /** Failed runs in a row before a feed counts as failing. */
  failing: 3,
  /** Days without a post before a source counts as quiet. A daily paper notices a month's silence. */
  quietDays: 30,
  /** Days a source added to the paper is called new, before it is judged. */
  newDays: 14,
  /** New items needed before "unreadable" can be said, and the share of them that never reached review. */
  unreadable: { items: 3, share: 0.8 },
  /** Reviewed articles needed before yield is judged, and the share published below which it is low. */
  low: { reviewed: 8, share: 0.25 },
  /** Reviewed articles and share published for a strong source. */
  strong: { reviewed: 5, share: 0.6 },
};

const DAY = 86_400_000;

/** A span of days in words: "9 days", "3 months", "over a year". */
function ago(days: number): string {
  if (days < 60) return `${Math.round(days)} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return 'over a year';
}

/** What a source gives the paper: stories, or lines in the Bulletin from a forum or a tool's releases. */
export type SourceKind = 'story' | 'forum' | 'tool';

/** The kind of a source of the paper, by its type. */
export const kindOf = (type?: string): SourceKind => (type === 'discussion' ? 'forum' : type === 'code' ? 'tool' : 'story');

export interface VerdictOptions {
  kind?: SourceKind;
  /** The day the source was added to the paper, when that is after the record begins. */
  since?: string;
}

const shortDay = (day: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));

/**
 * What to make of a source, most pressing reason first. A verdict prompts a decision; it never makes one. A source
 * of Bulletin lines is not judged on its yield: a forum's posts are mostly questions, turned away by design, and every
 * release of a tool is printed.
 */
export function verdict(tally: SourceTally, feed: FeedState = {}, now = Date.now(), options: VerdictOptions = {}): Verdict {
  const { kind = 'story', since } = options;
  if ((feed.failures ?? 0) >= RULES.failing) return { standing: 'failing', says: `Failing: ${feed.failures} runs in a row`, look: true };

  const lost = tally.dropped + tally.unread;
  if (tally.new >= RULES.unreadable.items && lost / tally.new >= RULES.unreadable.share) {
    return { standing: 'unreadable', says: `Unreadable: ${lost} of ${tally.new} never reached review`, look: true };
  }

  const added = since ? Date.parse(`${since}T00:00:00Z`) : NaN;
  const isNew = !Number.isNaN(added) && now - added < RULES.newDays * DAY;
  const last = Date.parse(feed.lastPostAt ?? '');
  // A source just added has not had the time to be quiet in the paper.
  if (!isNew && !Number.isNaN(last) && now - last > RULES.quietDays * DAY) return { standing: 'quiet', says: `Quiet for ${ago((now - last) / DAY)}`, look: true };
  if (isNew) return { standing: 'new', says: `New since ${shortDay(since!)}${tally.new === 0 ? ', no post yet' : ''}`, look: false };

  if (kind === 'forum') return { standing: 'keep', says: `Answers · ${tally.published} Bulletin ${tally.published === 1 ? 'line' : 'lines'}`, look: false };
  if (kind === 'tool') return { standing: 'keep', says: 'Answers · every release printed', look: false };

  const share = tally.reviewed ? tally.published / tally.reviewed : 0;
  const printed = `${tally.published} of ${tally.reviewed} printed`;
  if (tally.reviewed >= RULES.low.reviewed && share < RULES.low.share) return { standing: 'low', says: `Low yield · ${printed}`, look: true };
  if (tally.reviewed >= RULES.strong.reviewed && share >= RULES.strong.share) return { standing: 'strong', says: 'Strong', look: false };
  if (tally.reviewed < RULES.strong.reviewed) return { standing: 'new', says: 'Too few to say', look: false };
  return { standing: 'keep', says: `Keep · ${Math.round(share * 100)}% printed`, look: false };
}

/** The scorecard in a sentence: "21 sources: 4 need a look, 2 strong, 15 new or too few to say." */
export function standings(rows: { verdict: Verdict }[]): string {
  const count = (test: (verdict: Verdict) => boolean) => rows.filter((row) => test(row.verdict)).length;
  const look = count((v) => v.look);
  const parts = [
    look ? `${look} ${look === 1 ? 'needs' : 'need'} a look` : 'none needs a look',
    [count((v) => v.standing === 'strong'), 'strong'],
    [count((v) => v.standing === 'keep'), 'doing fine'],
    [count((v) => v.standing === 'new'), 'new or too few to say'],
  ].flatMap((part) => (typeof part === 'string' ? [part] : part[0] ? [`${part[0]} ${part[1]}`] : []));
  return `${rows.length} ${rows.length === 1 ? 'source' : 'sources'}: ${parts.join(', ')}.`;
}

export interface ScoreRow {
  id: string;
  name: string;
  tally: SourceTally;
  /** Share of the reviewed that were published, as a whole percentage. Undefined with nothing reviewed. */
  yield?: number;
  averageScore?: number;
  tokensPerStory?: number;
  lastPostAt?: string;
  kind: SourceKind;
  verdict: Verdict;
}

const ORDER: Standing[] = ['strong', 'keep', 'new', 'low', 'quiet', 'unreadable', 'failing'];

/** One row per source of the paper, the strongest first and the ones needing a look last. */
export function scorecard(
  sources: { id: string; name: string; type?: string }[],
  tallies: Record<string, SourceTally>,
  feeds: Record<string, FeedState>,
  now = Date.now(),
  /** The day each source was added to the paper, for those added after the record begins. */
  added: Record<string, string> = {},
): ScoreRow[] {
  return sources
    .map((source) => {
      const tally = tallies[source.id] ?? emptyTally();
      const scores = tally.scores;
      return {
        id: source.id,
        name: source.name,
        tally,
        yield: tally.reviewed ? Math.round((tally.published / tally.reviewed) * 100) : undefined,
        averageScore: scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10 : undefined,
        tokensPerStory: tally.published ? Math.round(tally.tokens / tally.published) : undefined,
        lastPostAt: feeds[source.id]?.lastPostAt,
        kind: kindOf(source.type),
        verdict: verdict(tally, feeds[source.id], now, { kind: kindOf(source.type), since: added[source.id] }),
      };
    })
    .sort((a, b) => ORDER.indexOf(a.verdict.standing) - ORDER.indexOf(b.verdict.standing) || b.tally.published - a.tally.published || a.name.localeCompare(b.name));
}

/** A run's date and what it recorded of each source, as `parseRuns` in src/lib/stats.ts gives them. */
interface Recorded {
  date: string;
  sources: Record<string, SourceTally>;
}

/**
 * The day each source was added to the paper: the first run that recorded it. A source recorded by the first run of
 * all was there from the start, and is left out.
 */
export function addedOn(runs: Recorded[]): Record<string, string> {
  const dated = runs.filter((run) => Object.keys(run.sources).length > 0).sort((a, b) => a.date.localeCompare(b.date));
  const first: Record<string, string> = {};
  for (const run of dated) for (const id of Object.keys(run.sources)) first[id] ??= run.date;
  const start = dated[0]?.date;
  return Object.fromEntries(Object.entries(first).filter(([, date]) => date !== start));
}

/** The new posts each source brought to each of `days`, by the edition day of the run that met them. */
export function postsByDay(runs: Recorded[], days: string[]): Record<string, number[]> {
  const at = new Map(days.map((day, i) => [day, i]));
  const posts: Record<string, number[]> = {};
  for (const run of runs) {
    const i = at.get(run.date);
    if (i === undefined) continue;
    for (const [id, tally] of Object.entries(run.sources)) (posts[id] ??= days.map(() => 0))[i] += tally.new;
  }
  return posts;
}
