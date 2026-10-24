// The Deadlines page: what is being enforced or retired, and when, from the
// release editions' Release Updates. Nothing here invents a day: an update is
// placed under the release the notes name, and the release's own dates from
// Trust are set beside it. Nothing here knows whose releases they are.

import { linkTo, type Edition, type Enforced } from './release-edition';
import { when, type Release } from './releases';

/** Where an update stands in time, as the notes put it. */
export type Timing = { kind: 'in' | 'before'; release: string } | { kind: 'cancelled' } | { kind: 'unknown' };

const SEASONS = ['winter', 'spring', 'summer'];
const SEASON = String.raw`(winter|spring|summer)\s+'?(\d\d)`;

/** A release's name as the paper writes it, whatever quote mark the notes used: "Spring '27". */
export function releaseName(text: string): string | undefined {
  const match = text.replace(/[‘’`´]/g, "'").match(new RegExp(SEASON, 'i'));
  return match ? `${match[1][0].toUpperCase()}${match[1].slice(1).toLowerCase()} '${match[2]}` : undefined;
}

/** Where a release falls among the others: Winter '27 comes out before Spring '27, which comes before Summer '27. */
export function releaseOrder(name: string): number {
  const match = name.match(new RegExp(SEASON, 'i'));
  return match ? Number(match[2]) * 3 + SEASONS.indexOf(match[1].toLowerCase()) : Number.MAX_SAFE_INTEGER;
}

/** The section of the notes an update stands under, read as a timing. "This release" is the edition's own. */
export function timingOf(section: string, release: string): Timing {
  if (/cancel/i.test(section)) return { kind: 'cancelled' };
  if (/enforced with this release/i.test(section)) return { kind: 'in', release };
  const named = releaseName(section);
  if (!named) return { kind: 'unknown' };
  return { kind: /\bbefore\b/i.test(section) ? 'before' : 'in', release: named };
}

export interface Deadline extends Enforced {
  /** Where its release note is read. */
  link: string;
  timing: Exclude<Timing, { kind: 'cancelled' }>;
  /** The edition it was taken from. */
  from: string;
}

/**
 * Every update the editions list, once each. Editions are taken newest first,
 * and an update listed by more than one (known by its topic) keeps the newest
 * one's timing, so an update Salesforce has moved moves here too. Called-off
 * updates are left out.
 */
export function deadlinesFrom(editions: Edition[]): Deadline[] {
  const newest = [...editions].sort((a, b) => b.release.number.localeCompare(a.release.number, 'en', { numeric: true }));
  const seen = new Set<string>();
  const all: Deadline[] = [];
  for (const edition of newest) {
    for (const update of edition.enforced) {
      if (seen.has(update.topic)) continue;
      seen.add(update.topic);
      const timing = timingOf(update.when, edition.release.name);
      if (timing.kind === 'cancelled') continue;
      all.push({ ...update, link: linkTo(edition, update.topic), timing, from: edition.release.name });
    }
  }
  return all;
}

export interface Group {
  /** "before" is the band of updates due any time before the release; "in" those that come with it. "unknown" has no release. */
  kind: 'before' | 'in' | 'unknown';
  release?: string;
  /** The release's dates, when Trust has given them. */
  dates?: Release;
  /** The day the group falls due, YYYY-MM-DD, when its release's dates are known. */
  due?: string;
  /** Already in force: the release has arrived. */
  past: boolean;
  items: Deadline[];
}

/** The day a group falls due: the first day of the release for updates due before it, the first day of production for those that come with it. */
function dueOf(kind: 'before' | 'in', dates: Release | undefined): string | undefined {
  if (!dates) return undefined;
  if (kind === 'before') return dates.stages[0]?.from;
  return (dates.stages.find((stage) => stage.place === 'production') ?? dates.stages[0])?.from;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A day the notes name, "1 Dec 2026", as YYYY-MM-DD. */
export function isoDay(day: string | undefined): string | undefined {
  const match = day?.match(/^(\d{1,2}) (\w{3}) (\d{4})$/);
  const month = match ? MONTHS.indexOf(match[2]) : -1;
  return match && month >= 0 ? `${match[3]}-${String(month + 1).padStart(2, '0')}-${match[1].padStart(2, '0')}` : undefined;
}

/**
 * The updates in the order the page sets them: what is still to come, soonest
 * first, with a release's "before" band above its own; then what is already in
 * force, the latest first. A release without dates goes after those with them.
 * An update falls due on the day the notes name for it, if they name one, and
 * otherwise with its group, so one dated after its release has arrived is
 * still to come, under its release.
 */
export function grouped(deadlines: Deadline[], releases: Release[], today: string): Group[] {
  const groups = new Map<string, Group>();
  // The releases that have begun, by where they fall.
  const begun = releases.filter((release) => release.stages[0] && release.stages[0].from <= today).map((release) => releaseOrder(release.name));
  for (const deadline of deadlines) {
    const { timing } = deadline;
    let dates: Release | undefined;
    let due: string | undefined;
    let past = false;
    if (timing.kind !== 'unknown') {
      dates = releases.find((release) => releaseName(release.name) === timing.release);
      due = isoDay(deadline.deadline) ?? dueOf(timing.kind, dates);
      // Without a day, a release is past only if a release after it has begun, or it has itself and the update was due before it.
      const order = releaseOrder(timing.release);
      past = due ? due <= today : begun.some((one) => one > order || (one === order && timing.kind === 'before'));
    }
    const key = timing.kind === 'unknown' ? 'unknown' : `${timing.kind} ${timing.release} ${past}`;
    let group = groups.get(key);
    if (!group) {
      group = timing.kind === 'unknown' ? { kind: 'unknown', past: false, items: [] } : { kind: timing.kind, release: timing.release, ...(dates ? { dates } : {}), past, items: [] };
      groups.set(key, group);
    }
    // The group falls due when the first of its updates does.
    if (due && (!group.due || due < group.due)) group.due = due;
    group.items.push(deadline);
  }
  const place = (group: Group) => (group.release ? releaseOrder(group.release) * 2 + (group.kind === 'before' ? 0 : 1) : Number.MAX_SAFE_INTEGER);
  const all = [...groups.values()];
  for (const group of all) {
    // Within a group, an update with its own day named comes first, the soonest at the head.
    const day = (item: Deadline) => (item.deadline && Date.parse(item.deadline)) || Number.MAX_SAFE_INTEGER;
    group.items.sort((a, b) => day(a) - day(b));
  }
  const ahead = all.filter((group) => !group.past).sort((a, b) => place(a) - place(b) || (a.due ?? '').localeCompare(b.due ?? ''));
  const past = all.filter((group) => group.past).sort((a, b) => place(b) - place(a));
  return [...ahead, ...past];
}

/** "in 3 days", "in 5 weeks", "in 4 months", or "today", from one day to another, both YYYY-MM-DD. */
export function countdown(today: string, due: string): string {
  const days = Math.round((Date.parse(due) - Date.parse(today)) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 14) return `in ${days} days`;
  if (days < 60) return `in ${Math.round(days / 7)} weeks`;
  const months = Math.round(days / 30.4);
  return `in ${months} ${months === 1 ? 'month' : 'months'}`;
}

/** The line under a group's heading: its dates and how long until it falls due. */
export function groupLine(group: Group, today: string): string {
  if (group.kind === 'unknown') return 'The notes give no release for these.';
  const dates = group.dates?.stages.map((stage) => `${stage.place[0].toUpperCase()}${stage.place.slice(1)} ${when(stage, today)}`).join(' · ');
  const lead = group.kind === 'before' ? `Any time before ${group.release} arrives` : group.past ? 'In force' : '';
  const parts = [lead, dates ?? 'Dates not yet announced', !group.past && group.due ? countdown(today, group.due) : ''].filter(Boolean);
  return parts.join(' · ');
}

/** How many updates still to come fall due within so many days: on their own day, or with their group. */
export function dueWithin(groups: Group[], today: string, days = 30): number {
  const until = new Date(Date.parse(today) + days * 86_400_000).toISOString().slice(0, 10);
  return groups
    .filter((group) => !group.past)
    .flatMap((group) => group.items.map((item) => isoDay(item.deadline) ?? dueOf(group.kind === 'before' ? 'before' : 'in', group.dates)))
    .filter((due) => due && due > today && due <= until).length;
}

/** The paper's stories that are about an update: those that use one of its phrases. Newest first, at most `most`. */
export function storiesAbout<T extends { text: string; date: string }>(deadline: Deadline, stories: T[], most = 3): T[] {
  const phrases = (deadline.phrases ?? []).map((phrase) => phrase.trim().toLowerCase()).filter((phrase) => phrase.length >= 6);
  if (phrases.length === 0) return [];
  return stories
    .filter((story) => {
      const text = story.text.toLowerCase();
      return phrases.some((phrase) => text.includes(phrase));
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, most);
}
