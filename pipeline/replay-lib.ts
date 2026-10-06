import { kindFor, normalizeUrl, type Feedback } from './feedback';

// The parts of `npm run replay` that only decide things: which articles to
// judge again, what should become of each, and whether it did.

export type Fate = 'publish' | 'reject';
/** What one judgement came to. `review` is an article the cheap rules let through when the model was not asked. */
export type Got = Fate | 'review' | 'unread' | 'failed';
export type Mark = 'right' | 'wrong' | 'unstable' | 'open' | 'unread';

export interface Case {
  url: string;
  title: string;
  /** The source's name, as the paper prints it. */
  source: string;
  /** A flag is something the paper got wrong; a control is something it got right and must go on getting right. */
  role: 'flag' | 'control';
  expect: Fate;
  /** Why it was flagged, when the reader said. */
  note?: string;
}

/** An article as a run recorded it. */
export interface Logged {
  title: string;
  url: string;
  source: string;
  outcome: string;
}

const address = (url: string) => {
  try {
    return normalizeUrl(url);
  } catch {
    return url;
  }
};

/**
 * The articles to judge again: every flag, then up to `controls` unflagged
 * articles of each fate. `logged` is newest first, so the controls are recent ones.
 */
export function buildCases(feedback: Feedback[], logged: Logged[], controls: number): Case[] {
  const cases = new Map<string, Case>();
  const titles = new Map(logged.map((article) => [address(article.url), article]));
  for (const flag of feedback) {
    const url = address(flag.url);
    const known = titles.get(url);
    cases.set(url, {
      url,
      title: flag.title ?? known?.title ?? url,
      source: flag.source ?? known?.source ?? '',
      role: 'flag',
      expect: flag.kind === 'junk' ? 'reject' : 'publish',
      ...(flag.note ? { note: flag.note } : {}),
    });
  }
  const taken: Record<Fate, number> = { publish: 0, reject: 0 };
  for (const article of logged) {
    const url = address(article.url);
    const kind = kindFor(article.outcome);
    if (!kind || cases.has(url)) continue;
    // What the paper did with it stands as right, since nobody said otherwise.
    const expect: Fate = kind === 'junk' ? 'publish' : 'reject';
    if (taken[expect] >= controls) continue;
    taken[expect]++;
    cases.set(url, { url, title: article.title, source: article.source, role: 'control', expect });
  }
  return [...cases.values()];
}

export interface Judgement {
  got: Got;
  why: string;
  score?: number;
}

/** What the paper would do with an article, from the cheap rules and then the model's verdict. */
export function judgement(prefiltered: string | null, verdict: { relevant: boolean; interest_score: number } | undefined, threshold: number): Judgement {
  if (prefiltered) return { got: 'reject', why: prefiltered };
  if (!verdict) return { got: 'review', why: 'reaches review' };
  if (!verdict.relevant) return { got: 'reject', why: 'not relevant', score: verdict.interest_score };
  if (verdict.interest_score < threshold) return { got: 'reject', why: `scored ${verdict.interest_score}, below ${threshold}`, score: verdict.interest_score };
  return { got: 'publish', why: `scored ${verdict.interest_score}`, score: verdict.interest_score };
}

/** Whether an article came out as it should, over one or more judgements of it. */
export function mark(expect: Fate, gots: Got[]): Mark {
  const judged = gots.filter((got) => got !== 'unread' && got !== 'failed');
  if (judged.length === 0) return 'unread';
  // Judged more than once with different answers: neither a win nor a loss.
  if (new Set(judged).size > 1) return 'unstable';
  if (judged[0] === 'review') return 'open';
  return judged[0] === expect ? 'right' : 'wrong';
}

export interface Result extends Case {
  mark: Mark;
  judgements: Judgement[];
}

export interface Tally {
  right: number;
  wrong: number;
  unstable: number;
  open: number;
  unread: number;
  total: number;
}

export function tally(results: Result[], role: Case['role']): Tally {
  const count: Tally = { right: 0, wrong: 0, unstable: 0, open: 0, unread: 0, total: 0 };
  for (const result of results) {
    if (result.role !== role) continue;
    count[result.mark]++;
    count.total++;
  }
  return count;
}

export function sentence(name: string, count: Tally): string {
  const rest = (['wrong', 'unstable', 'open', 'unread'] as const)
    .filter((key) => count[key] > 0)
    .map((key) => `${count[key]} ${{ wrong: 'wrong', unstable: 'unstable', open: 'left to the model', unread: 'could not be read' }[key]}`);
  return `${name}: ${count.right} of ${count.total} right${rest.length ? ` (${rest.join(', ')})` : ''}.`;
}

export interface Flip {
  title: string;
  role: Case['role'];
  from: Mark;
  to: Mark;
  /** Whether the change is for the better. Undefined when neither side is a plain right or wrong. */
  better?: boolean;
}

/** The articles that came out differently from the last replay. */
export function compare(before: Result[], after: Result[]): Flip[] {
  const was = new Map(before.map((result) => [result.url, result.mark]));
  return after.flatMap((result) => {
    const from = was.get(result.url);
    if (from === undefined || from === result.mark) return [];
    const better = result.mark === 'right' ? true : from === 'right' ? false : undefined;
    return [{ title: result.title, role: result.role, from, to: result.mark, ...(better === undefined ? {} : { better }) }];
  });
}
