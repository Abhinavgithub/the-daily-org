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
  /** Days without a post before a source counts as quiet. */
  quietDays: 60,
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

/** What to make of a source, most pressing reason first. A verdict prompts a decision; it never makes one. */
export function verdict(tally: SourceTally, feed: FeedState = {}, now = Date.now()): Verdict {
  if ((feed.failures ?? 0) >= RULES.failing) return { standing: 'failing', says: `Failing: ${feed.failures} runs in a row`, look: true };

  const lost = tally.dropped + tally.unread;
  if (tally.new >= RULES.unreadable.items && lost / tally.new >= RULES.unreadable.share) {
    return { standing: 'unreadable', says: `Unreadable: ${lost} of ${tally.new} never reached review`, look: true };
  }

  const last = Date.parse(feed.lastPostAt ?? '');
  if (!Number.isNaN(last) && now - last > RULES.quietDays * DAY) return { standing: 'quiet', says: `Quiet for ${ago((now - last) / DAY)}`, look: true };

  const share = tally.reviewed ? tally.published / tally.reviewed : 0;
  if (tally.reviewed >= RULES.low.reviewed && share < RULES.low.share) return { standing: 'low', says: 'Watch: low yield', look: true };
  if (tally.reviewed >= RULES.strong.reviewed && share >= RULES.strong.share) return { standing: 'strong', says: 'Keep: strong', look: false };
  if (tally.reviewed < RULES.strong.reviewed) return { standing: 'new', says: 'Too new to say', look: false };
  return { standing: 'keep', says: 'Keep', look: false };
}

/** The scorecard in a sentence: "21 sources: 4 need a look, 2 strong, 15 too new to say." */
export function standings(rows: { verdict: Verdict }[]): string {
  const count = (test: (verdict: Verdict) => boolean) => rows.filter((row) => test(row.verdict)).length;
  const look = count((v) => v.look);
  const parts = [
    look ? `${look} ${look === 1 ? 'needs' : 'need'} a look` : 'none needs a look',
    [count((v) => v.standing === 'strong'), 'strong'],
    [count((v) => v.standing === 'keep'), 'doing fine'],
    [count((v) => v.standing === 'new'), 'too new to say'],
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
  verdict: Verdict;
}

const ORDER: Standing[] = ['strong', 'keep', 'new', 'low', 'quiet', 'unreadable', 'failing'];

/** One row per source of the paper, the strongest first and the ones needing a look last. */
export function scorecard(
  sources: { id: string; name: string }[],
  tallies: Record<string, SourceTally>,
  feeds: Record<string, FeedState>,
  now = Date.now(),
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
        verdict: verdict(tally, feeds[source.id], now),
      };
    })
    .sort((a, b) => ORDER.indexOf(a.verdict.standing) - ORDER.indexOf(b.verdict.standing) || b.tally.published - a.tally.published || a.name.localeCompare(b.name));
}
