import type { Edition, Enforced, Feature, NoteEntry, NotesChange, UpdateChange } from './release-edition';

// Following the release notes after an edition is built. Salesforce goes on revising the notes all through a
// release: features are added, entries reworded, dates for Release Updates moved. Each check of the notes keeps a
// fingerprint of every entry, and the next check compares the notes with it, so the page can say what is new,
// what changed and what left the notes, and when a deadline moved. The notes are compared, not the features the
// model drew from them, which would differ from one reading to the next even where the notes did not.

/** Days a feature is marked new or changed, and a moved deadline marked so, after the check that found it. */
export const LABEL_DAYS = 30;
/** Days between checks once an edition has had its two builds. */
export const REFRESH_DAYS = 7;

/** The entries of `now` that are new since `before`, those whose text changed, and the topics that left. */
export function compareEntries(before: NoteEntry[], now: NoteEntry[]): { added: string[]; changed: string[]; gone: string[] } {
  const was = new Map(before.map((entry) => [entry.topic, entry]));
  const is = new Set(now.map((entry) => entry.topic));
  // An entry listed under two areas is one entry: each topic is said once.
  const once = (topics: string[]) => [...new Set(topics)];
  return {
    added: once(now.filter((entry) => !was.has(entry.topic)).map((entry) => entry.topic)),
    changed: once(now.filter((entry) => was.has(entry.topic) && was.get(entry.topic)!.hash !== entry.hash).map((entry) => entry.topic)),
    gone: once(before.filter((entry) => !is.has(entry.topic)).map((entry) => entry.topic)),
  };
}

/** What a Release Update's standing is called, for a line: "Enforced with this release", "Postponed". */
const standing = (update: Enforced) => update.when || 'Not filed';

/**
 * The Release Updates that are new, whose day or standing changed, or that left the notes. A day and a standing
 * that both changed are two changes. An update is known by its topic.
 */
export function compareUpdates(before: Enforced[], now: Enforced[]): UpdateChange[] {
  const was = new Map(before.map((update) => [update.topic, update]));
  const changes: UpdateChange[] = [];
  for (const update of now) {
    const old = was.get(update.topic);
    if (!old) {
      changes.push({ topic: update.topic, name: update.name, kind: 'new', now: standing(update) });
      continue;
    }
    if ((old.deadline ?? '') !== (update.deadline ?? '')) changes.push({ topic: update.topic, name: update.name, kind: 'date', was: old.deadline ?? 'no day named', now: update.deadline ?? 'no day named' });
    if (standing(old) !== standing(update)) changes.push({ topic: update.topic, name: update.name, kind: 'status', was: standing(old), now: standing(update) });
  }
  const is = new Set(now.map((update) => update.topic));
  for (const old of before) if (!is.has(old.topic)) changes.push({ topic: old.topic, name: old.name, kind: 'removed', was: old.deadline ?? standing(old) });
  return changes;
}

/** What a check found, put together, or nothing when the notes had not changed. `features` are the edition's before the check. */
export function noteChanges(at: string, before: NoteEntry[], now: NoteEntry[], features: (Feature & { area: string })[], updates: UpdateChange[]): NotesChange | undefined {
  const { added, changed, gone } = compareEntries(before, now);
  const left = new Set(gone);
  const removed = features.filter((feature) => left.has(feature.topic)).map(({ topic, name, area }) => ({ topic, name, area }));
  if (added.length + changed.length + removed.length + updates.length === 0) return undefined;
  return { at, added, changed, removed, updates };
}

const daysBetween = (from: string, to: string) => (Date.parse(to) - Date.parse(from)) / 86_400_000;

/** How a feature is marked: new or changed, by the latest check that found it so within LABEL_DAYS. */
export function labelOf(edition: Pick<Edition, 'changes'>, topic: string, today: string): { kind: 'added' | 'changed'; at: string } | undefined {
  for (const change of [...(edition.changes ?? [])].reverse()) {
    if (daysBetween(change.at, `${today}T23:59:59Z`) > LABEL_DAYS) break;
    if (change.added.includes(topic)) return { kind: 'added', at: change.at };
    if (change.changed.includes(topic)) return { kind: 'changed', at: change.at };
  }
  return undefined;
}

/** The latest change to a Release Update within LABEL_DAYS, for its card on the Deadlines page. */
export function updateChangeOf(edition: Pick<Edition, 'changes'>, topic: string, today: string): (UpdateChange & { at: string }) | undefined {
  for (const change of [...(edition.changes ?? [])].reverse()) {
    if (daysBetween(change.at, `${today}T23:59:59Z`) > LABEL_DAYS) break;
    const found = [...change.updates].reverse().find((update) => update.topic === topic && update.kind !== 'removed');
    if (found) return { ...found, at: change.at };
  }
  return undefined;
}

/** The features printed before that left the notes within LABEL_DAYS, with when the check found them gone. */
export function removedLately(edition: Pick<Edition, 'changes'>, today: string): { topic: string; name: string; area: string; at: string }[] {
  return (edition.changes ?? []).filter((change) => daysBetween(change.at, `${today}T23:59:59Z`) <= LABEL_DAYS).flatMap((change) => change.removed.map((feature) => ({ ...feature, at: change.at })));
}

/** One line for a change to a Release Update: "its day moved from 1 Dec 2026 to 2 Feb 2027". The notes' own headings are quoted as they write them. */
export function updateLine(change: UpdateChange): string {
  switch (change.kind) {
    case 'new':
      return `new to the notes${change.now ? `, filed under "${change.now}"` : ''}`;
    case 'date':
      return `its day moved from ${change.was} to ${change.now}`;
    case 'status':
      return `now filed under "${change.now}", not "${change.was}"`;
    case 'removed':
      return 'no longer in the notes';
  }
}
