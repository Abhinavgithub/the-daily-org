import { normalizeUrl } from '../../pipeline/feedback';
import type { Watch } from '../../pipeline/known-issues';
import type { Pending } from '../../pipeline/dedupe';
import type { State } from '../../pipeline/state';
import { OUTCOME_LABELS, proofFate, runId, type ArticleOutcome, type ReleaseStatus, type RunLogData } from './logs';
import type { Release } from './releases';
import { updateLine } from './release-changes';
import type { NotesChange } from './release-edition';
import type { ReportRow } from './verdict';

// The review queue (/logs/review/): what needs the editor's eye, from every place the paper keeps it, as one list.
// Each item says why it is there, links to what it came from and to what the paper made of it, and can be followed
// through every run that met it. An item is dealt with by pressing Done, which data/review.json remembers by the
// item's id; an id names the item as it stands, so one that changes (a feed that fails again, an issue whose status
// moves) is a new item and comes back. Nothing here calls a model or changes the paper.

/** Days back the run logs are looked through for what needs a look. */
export const REVIEW_DAYS = 14;
/** Days an item dealt with stays listed under "Done". */
export const DONE_DAYS = 7;
/** A Known Issue the Bulletin would print (PLAN.md 9c, not yet decided): this many affected ... */
export const ISSUE_AFFECTED = 50;
/** ... while under this many days old. */
export const ISSUE_DAYS = 14;
/** A release starting within this many days is listed. */
export const RELEASE_DAYS = 30;

export type ReviewKind = 'flag' | 'report' | 'held' | 'waiting' | 'feed' | 'issue' | 'release';

export const GROUPS: { kind: ReviewKind; label: string; none: string }[] = [
  { kind: 'flag', label: 'Needs a look', none: `Nothing in the last ${REVIEW_DAYS} days' runs.` },
  { kind: 'report', label: 'Reader reports', none: 'No open reports.' },
  { kind: 'held', label: 'Held stories', none: 'Nothing is held.' },
  { kind: 'waiting', label: 'Waiting to be judged', none: 'Nothing is waiting.' },
  { kind: 'feed', label: 'Feed failures', none: 'Every feed answered its last run.' },
  { kind: 'issue', label: 'Known Issues', none: 'No issue would be printed.' },
  { kind: 'release', label: 'Release notes', none: 'Nothing new about releases.' },
];

export interface Link {
  label: string;
  href: string;
  /** Opens elsewhere: the article, a feed, an issue page. */
  external?: boolean;
}

/** One step of an article's life: what a run did with it. */
export interface Stage {
  ranAt: string;
  outcome: ArticleOutcome;
  label: string;
  score?: number;
  reason?: string;
  /** The run on the Logs page. */
  href: string;
}

export interface ReviewItem {
  /** Names the item as it stands; Done is remembered by it. */
  id: string;
  kind: ReviewKind;
  title: string;
  /** Why it is here, as a sentence. */
  says: string;
  /** When it happened, for the order: newest first. */
  at: string;
  links: Link[];
  /** The text the paper made, or was sent, shown in place: a held story's summary, a reader's note. */
  text?: string;
  history?: Stage[];
}

const address = (url: string) => {
  try {
    return normalizeUrl(url);
  } catch {
    return url;
  }
};

/** Every article any run met, by its address, each with what each run did with it, the earliest first. */
export function history(logs: RunLogData[]): Map<string, Stage[]> {
  const byUrl = new Map<string, Stage[]>();
  for (const log of logs) {
    for (const article of log.articles) {
      const key = address(article.url);
      const stages = byUrl.get(key) ?? [];
      stages.push({ ranAt: log.ranAt, outcome: article.outcome, label: OUTCOME_LABELS[article.outcome], score: article.score, reason: article.reason, href: `/logs/#${runId(log.ranAt)}` });
      byUrl.set(key, stages);
    }
  }
  for (const stages of byUrl.values()) stages.sort((a, b) => a.ranAt.localeCompare(b.ranAt));
  return byUrl;
}

/** Where the paper prints an article: its story, or the story it is a line under. By address. */
export type Printed = Map<string, string>;

/** A day as the page says it: "Tue 10 Nov". Days are YYYY-MM-DD. */
export const dayName = (day: string) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${day.slice(0, 10)}T12:00:00Z`));

/** The story a repeat was made a line under, and the day it was printed when that was another, from the run's reason. */
export function repeatOf(reason: string): { title: string; day?: string } | undefined {
  const match = reason.match(/the same story as "(.+?)"(?:, printed on (\d{4}-\d{2}-\d{2}))?/);
  return match ? { title: match[1], ...(match[2] ? { day: match[2] } : {}) } : undefined;
}

const since = (now: Date, days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const sourceLink = (url: string): Link => ({ label: 'Original', href: url, external: true });
const printedLink = (printed: Printed, url: string): Link[] => {
  const href = printed.get(address(url));
  return href ? [{ label: 'As printed', href }] : [];
};

/** What the runs of the last REVIEW_DAYS days did that a person should look at. */
export function flagsFrom(logs: RunLogData[], printed: Printed, now: Date): ReviewItem[] {
  const from = since(now, REVIEW_DAYS);
  const lives = history(logs);
  const items: ReviewItem[] = [];
  for (const log of logs.filter((one) => one.ranAt >= from)) {
    // Proof-reading and diagrams are logged by headline; the article that headline was printed for gives the address.
    const urlOf = new Map(log.articles.map((article) => [article.title, article.url]));
    const add = (what: string, title: string, says: string, url?: string) =>
      items.push({
        id: `flag:${log.ranAt}:${what}:${url ? address(url) : title}`,
        kind: 'flag',
        title,
        says,
        at: log.ranAt,
        links: [...(url ? [sourceLink(url), ...printedLink(printed, url)] : []), { label: 'The run', href: `/logs/#${runId(log.ranAt)}` }],
        history: url ? lives.get(address(url)) : undefined,
      });
    for (const proof of log.proofread) {
      const fate = proofFate(proof);
      if (fate === 'not-read') add('proof', proof.title, `Printed without being proof-read: ${proof.reason}.`, urlOf.get(proof.title));
      if (fate === 'refused') add('proof', proof.title, `The proof-reader's change was refused, so it was printed as written: ${proof.reason}.`, urlOf.get(proof.title));
    }
    for (const figure of log.figures) {
      if (figure.outcome === 'refused') add('figure', figure.title, `Its diagram was refused${figure.reason ? `: ${figure.reason}` : ''}.`, urlOf.get(figure.title));
      else if (figure.image === 'failed') add('image', figure.title, 'Its illustration could not be drawn; the diagram stands alone.', urlOf.get(figure.title));
    }
    for (const article of log.articles) {
      if (article.outcome === 'invalid-reply') add('reply', article.title, `The model's reply could not be used${article.reason ? `: ${article.reason}` : ''}. It is not tried again.`, article.url);
      // A repeat the code found when the model did not: worth a look that the two really are one story.
      if (article.reason?.includes('found by its headline')) {
        const of = repeatOf(article.reason);
        const under = of ? `"${of.title}"${of.day ? `, printed ${dayName(of.day)}` : ''}` : 'another story';
        add('repeat', article.title, `Made a line under ${under}, by its headline alone and not by the editor. Check the two are the same story.`, article.url);
      }
    }
  }
  return items;
}

/** A held story, as `readStories` gives it. */
export interface HeldStory {
  /** The file's name in data/held/, which starts with the day it was held. */
  name: string;
  data: Record<string, unknown>;
  body: string;
}

/** Each story held for a quieter day: when it was held, and when it must be printed at the latest. */
export function heldFrom(held: HeldStory[], logs: RunLogData[], holdDays: number): ReviewItem[] {
  const lives = history(logs);
  return held.map(({ name, data, body }) => {
    const day = name.slice(0, 10);
    const url = String(data.url ?? '');
    const latest = new Date(Date.parse(`${day}T12:00:00Z`) + holdDays * 86_400_000).toISOString().slice(0, 10);
    return {
      id: `held:${name}`,
      kind: 'held' as const,
      title: String(data.title ?? name),
      says: `Held ${dayName(day)}, scored ${String(data.interest_score ?? '?')}, from ${String(data.source ?? 'an unknown source')}. Printed on the first day with room, and on ${dayName(latest)} at the latest.`,
      at: `${day}T00:00:00.000Z`,
      links: url ? [sourceLink(url)] : [],
      text: body.trim(),
      history: url ? lives.get(address(url)) : undefined,
    };
  });
}

const WAITING_FOR: Record<Pending[string]['why'], string> = {
  unread: 'its page to be read',
  deferred: 'a run with calls to spare',
  'no-transcript': 'its captions',
  upcoming: 'the live event to happen',
};

/** What no run has judged yet: articles left for the next run, and videos waiting for captions or their event. */
export function waitingFrom(logs: RunLogData[], pending: Pending, sourceName: (id: string) => string, now: Date): ReviewItem[] {
  const from = since(now, REVIEW_DAYS);
  const lives = history(logs);
  const items: ReviewItem[] = [];
  const titles = new Map(logs.flatMap((log) => log.articles.map((article) => [address(article.url), article.title] as const)));
  for (const [key, stages] of lives) {
    const last = stages.at(-1)!;
    if (last.outcome !== 'deferred' || last.ranAt < from || pending[key]) continue;
    items.push({ id: `waiting:${key}:${last.ranAt}`, kind: 'waiting', title: titles.get(key) ?? key, says: `Left for the next run${last.reason ? `: ${last.reason}` : ''}.`, at: last.ranAt, links: [sourceLink(key)], history: stages });
  }
  for (const [url, waiting] of Object.entries(pending)) {
    const key = address(url);
    items.push({
      id: `waiting:${key}:${waiting.why}`,
      kind: 'waiting',
      title: titles.get(key) ?? url,
      says: `From ${sourceName(waiting.source)}, waiting since ${dayName(waiting.since)} for ${WAITING_FOR[waiting.why]}.`,
      at: `${waiting.since}T00:00:00.000Z`,
      links: [sourceLink(url)],
      history: lives.get(key),
    });
  }
  return items;
}

/** Each feed that failed its last run, for as many runs in a row as it has. */
export function feedsFrom(state: State, sources: { id: string; name: string; url: string }[]): ReviewItem[] {
  return sources.flatMap((source) => {
    const feed = state[source.id];
    if (!feed || feed.failures < 1) return [];
    const runs = feed.failures === 1 ? 'its last run' : `its last ${feed.failures} runs`;
    return [
      {
        id: `feed:${source.id}:${feed.failures}`,
        kind: 'feed' as const,
        title: source.name,
        says: `Failed ${runs}${feed.lastError ? `: ${feed.lastError}` : ''}. ${feed.lastSuccessAt ? `Last read in full ${dayName(feed.lastSuccessAt)}.` : 'Never read in full.'}`,
        at: feed.lastSuccessAt ?? '',
        links: [{ label: 'The feed', href: source.url, external: true }],
      },
    ];
  });
}

const latestOf = <T>(byDay: Record<string, T>): [string, T] | undefined => Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).at(-1);
const daysFrom = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
/** An issue's own page on Salesforce's help site. */
export const issuePage = (key: string) => `https://help.salesforce.com/s/issue?id=${key}`;

/**
 * The Known Issues the Bulletin would print under the rule PLAN.md 9c proposes, which is not switched on yet: one
 * that has reached ISSUE_AFFECTED affected while under ISSUE_DAYS days old, and one of those whose status has since
 * become Solution Deployed. Each is listed for REVIEW_DAYS days after it happened. The id carries the status, so
 * an issue comes back when it moves.
 */
export function issuesFrom(watch: Watch, today: string): ReviewItem[] {
  return Object.entries(watch).flatMap(([id, issue]) => {
    const [, affected = 0] = latestOf(issue.affected) ?? [];
    const [statusDay = issue.firstSeen, status = 'Unknown'] = latestOf(issue.status) ?? [];
    // The first day it was seen at the bar, if it was then still young enough.
    const reached = Object.entries(issue.affected)
      .sort(([a], [b]) => a.localeCompare(b))
      .find(([, count]) => count >= ISSUE_AFFECTED)?.[0];
    if (!reached || daysFrom(issue.created, reached) >= ISSUE_DAYS) return [];
    const growth = Object.entries(issue.affected)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => `${count} on ${dayName(day)}`)
      .join(', ');
    const deployed = status === 'Solution Deployed';
    // News for REVIEW_DAYS days: from reaching the bar, and again from a solution deployed.
    const recent = (day: string) => daysFrom(day, today) <= REVIEW_DAYS;
    if (!recent(reached) && !(deployed && recent(statusDay))) return [];
    return [
      {
        id: `issue:${id}:${status}`,
        kind: 'issue' as const,
        title: `${id}: ${issue.subject}`,
        says: `${deployed ? `Solution deployed ${dayName(statusDay)}. ` : `${status}. `}${affected} affected, filed ${dayName(issue.created)} (${growth}). Would be printed in the Bulletin; Known Issues are only watched for now.`,
        at: `${reached}T00:00:00.000Z`,
        links: [{ label: 'The issue', href: issuePage(issue.key), external: true }],
      },
    ];
  });
}

/** A release edition, as much of it as the queue needs. */
export interface EditionFacts {
  name: string;
  slug: string;
  builtAt: string;
  notesPublished?: string;
  notes?: string;
  /** What the checks of the notes found changed, the oldest first. */
  changes?: NotesChange[];
}

/** What is new about releases: a check that could not be made, an edition just built, and a release about to start. */
export function releasesFrom(status: ReleaseStatus | undefined, editions: EditionFacts[], releases: Release[], today: string, now: Date): ReviewItem[] {
  const items: ReviewItem[] = [];
  if (status && (status.outcome === 'failed' || status.outcome === 'could-not-ask')) {
    items.push({
      id: `release-check:${status.at}`,
      kind: 'release',
      title: status.outcome === 'failed' ? 'The release edition could not be built' : 'The release notes did not answer',
      says: `${status.says ?? 'No reason was given.'} Checked ${dayName(status.at)}.`,
      at: status.at,
      links: [],
    });
  }
  for (const edition of editions.filter((one) => one.builtAt >= since(now, REVIEW_DAYS))) {
    items.push({
      id: `release-edition:${edition.slug}:${edition.builtAt}`,
      kind: 'release',
      title: `${edition.name} release edition built`,
      says: `Built ${dayName(edition.builtAt)}${edition.notesPublished ? `; the notes were last revised ${dayName(edition.notesPublished)}` : ''}. Worth a read before readers see it.`,
      at: edition.builtAt,
      links: [{ label: 'The edition', href: `/releases/${edition.slug}/` }, ...(edition.notes ? [{ label: 'The notes', href: edition.notes, external: true }] : [])],
    });
  }
  // What a check of the notes found changed lately: worth a look, and a moved deadline most of all.
  for (const edition of editions) {
    for (const change of (edition.changes ?? []).filter((one) => one.at >= since(now, REVIEW_DAYS))) {
      const counts = [change.added.length && `${change.added.length} new`, change.changed.length && `${change.changed.length} changed`, change.removed.length && `${change.removed.length} printed ${change.removed.length === 1 ? 'feature' : 'features'} gone`].filter(Boolean);
      // A sentence for each kind of change to the Release Updates, the new and the gone each listed once.
      const of = (kind: string) => change.updates.filter((update) => update.kind === kind);
      const names = (kind: string) => of(kind).map((update) => update.name).join('; ');
      const updates = [
        of('new').length && `${of('new').length === 1 ? 'New release update' : 'New release updates'}: ${names('new')}.`,
        ...[...of('date'), ...of('status')].map((update) => `${update.name}: ${updateLine(update)}.`),
        of('removed').length && `Gone from the notes: ${names('removed')}.`,
      ].filter((line): line is string => Boolean(line));
      items.push({
        id: `release-change:${edition.slug}:${change.at}`,
        kind: 'release',
        title: `The ${edition.name} notes changed`,
        says: `Checked ${dayName(change.at)}. ${counts.length ? `Entries: ${counts.join(', ')}.` : ''}${updates.length ? ` ${updates.join(' ')}` : ''}`.trim(),
        at: change.at,
        links: [{ label: 'The edition', href: `/releases/${edition.slug}/` }, ...(updates.length ? [{ label: 'Deadlines', href: '/deadlines/' }] : [])],
      });
    }
  }
  for (const release of releases) {
    for (const stage of release.stages) {
      const away = daysFrom(today, stage.from);
      if (away < 0 || away > RELEASE_DAYS) continue;
      items.push({
        id: `release-date:${release.name}:${stage.place}:${stage.from}`,
        kind: 'release',
        title: `${release.name} reaches ${stage.place} ${dayName(stage.from)}`,
        says: `${away === 0 ? 'Today' : `In ${away} ${away === 1 ? 'day' : 'days'}`}. The Deadlines page and its calendar count down to it.`,
        at: `${stage.from}T00:00:00.000Z`,
        links: [{ label: 'Deadlines', href: '/deadlines/' }],
      });
    }
  }
  return items;
}

/** Readers' reports not yet dealt with. Their ids are the reports' own, as data/reader-feedback-handled.json keeps them. */
export function reportsFrom(reports: ReportRow[], handled: string[], stories: Map<string, { title: string; href: string; url: string }>): ReviewItem[] {
  const done = new Set(handled);
  return reports
    .filter((report) => !done.has(report.id))
    .map((report) => {
      const story = stories.get(report.story);
      return {
        id: `report:${report.id}`,
        kind: 'report' as const,
        title: story?.title ?? report.story,
        says: `A reader says the ${report.part.toLowerCase()} is wrong.`,
        at: report.at,
        text: report.note,
        links: story ? [sourceLink(story.url), { label: 'As printed', href: story.href }, { label: 'Deal with it', href: '/logs/#readers' }] : [{ label: 'Deal with it', href: '/logs/#readers' }],
      };
    });
}

/** What has been dealt with, by item id: when. */
export type Done = Record<string, string>;

/** The items still to deal with, and those dealt with lately, each newest first. */
export function queue(items: ReviewItem[], done: Done, now: Date): { open: ReviewItem[]; done: (ReviewItem & { doneAt: string })[] } {
  const newest = (a: { at: string }, b: { at: string }) => b.at.localeCompare(a.at) || 0;
  const from = since(now, DONE_DAYS);
  return {
    open: items.filter((item) => !done[item.id]).sort(newest),
    done: items
      .filter((item) => done[item.id] && done[item.id] >= from)
      .map((item) => ({ ...item, doneAt: done[item.id] }))
      .sort(newest),
  };
}

/** Whatever was saved, read as what has been done, or nothing done. */
export function readDone(text: string): Done {
  try {
    const raw = JSON.parse(text) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw).filter(([, at]) => typeof at === 'string' && !Number.isNaN(Date.parse(at))));
  } catch {
    return {};
  }
}

/** The saved record with one item marked done, or taken back. */
export function markDone(before: Done, id: string, done: boolean, now: Date): Done {
  const after = { ...before };
  if (done) after[id] = now.toISOString();
  else delete after[id];
  return after;
}
