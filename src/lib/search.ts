// The search page's matching, ranking and filters. The whole archive is one
// static index that the browser reads once; this decides what in it matches a
// search, in what order, and what each filter covers. It runs in the browser,
// so it reads nothing from disk.

/** What a result is: a story, a line from an edition's "In brief" box, an item in the Bulletin, or a release's notes. */
export type Kind = 'story' | 'brief' | 'bulletin' | 'release';

export const KINDS: { id: Kind; label: string }[] = [
  { id: 'story', label: 'Stories' },
  { id: 'brief', label: 'In brief' },
  { id: 'bulletin', label: 'Bulletin' },
  { id: 'release', label: 'Release notes' },
];

/** One entry in the index. */
export interface Entry {
  href: string;
  kind: Kind;
  title: string;
  /** The line under the headline. */
  why: string;
  source: string;
  /** The section's label, for stories and briefs; otherwise what the meta line names it by. */
  section: string;
  /** The day it was printed, YYYY-MM-DD, and as the page shows it. */
  date: string;
  day: string;
  /** For release notes, where in the notes it is filed: "Winter '27 · Platform › Lightning Components". */
  where?: string;
  /** Tags and the original title: weighed above the body, below the line under the headline. */
  tags: string;
  /** Everything else that is searched: the story's text, its authors. */
  text: string;
  personas: string[];
  signal: 'must' | 'recommended' | 'other';
}

/**
 * Lower case, accents dropped, and anything that is not a letter or digit as a
 * space, with a space at each end, so a term is found at the start of a word by
 * looking for it after a space. "Username-password" and "username password"
 * are then the same.
 */
export function plain(text: string): string {
  return ` ${text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()} `;
}

/** One part of a search: found when any of its forms is. */
export interface Clause {
  /** What was typed for it. */
  typed: string;
  /** Its forms, plain, each found at the start of a word. */
  forms: string[];
  /** The other names it was searched by, as the synonyms list writes them, for the line above the results. */
  also: string[];
}

/** A word's forms: the word, and the word without a plural "s", so "components" also finds "component". */
function wordForms(word: string): string[] {
  const forms = [word];
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) forms.push(word.slice(0, -1));
  return forms;
}

/**
 * A search as clauses, every one of which a result must have. A phrase in the
 * synonyms list is one clause with all of its group's names as forms; each
 * other word is a clause of its own. The longest phrase is taken first, so
 * "oauth password flow" is not read as "password flow".
 */
export function parse(query: string, synonyms: readonly (readonly string[])[] = []): Clause[] {
  let rest = plain(query);
  const clauses: Clause[] = [];
  const phrases = synonyms
    .flatMap((group) => group.map((name) => ({ name, key: plain(name), group })))
    .sort((a, b) => b.key.length - a.key.length);
  for (const { name, key, group } of phrases) {
    if (key.trim() === '') continue;
    // The phrase as whole words, or with a plural "s".
    const found = new RegExp(`${key.trimEnd().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s? `);
    if (!found.test(rest)) continue;
    rest = rest.replace(found, ' ');
    clauses.push({ typed: name, forms: [...new Set(group.map((other) => plain(other).trim()))], also: group.filter((other) => plain(other) !== key) });
  }
  for (const word of rest.trim().split(' ').filter(Boolean)) clauses.push({ typed: word, forms: wordForms(word), also: [] });
  return clauses;
}

/** How much a find counts for, by where it is. */
export const WEIGHTS = { title: 10, why: 4, tags: 3, source: 2, text: 1 } as const;

type Fields = Record<keyof typeof WEIGHTS, string>;
const fieldsOf = (entry: Entry): Fields => ({
  title: plain(entry.title),
  why: plain(entry.why),
  tags: plain(`${entry.tags} ${entry.where ?? ''}`),
  source: plain(`${entry.source} ${entry.section}`),
  text: plain(entry.text),
});

/** How often `form` starts a word in `text`, up to `cap`. */
function count(text: string, form: string, cap: number): number {
  let n = 0;
  for (let at = text.indexOf(` ${form}`); at !== -1 && n < cap; at = text.indexOf(` ${form}`, at + 1)) n++;
  return n;
}

/**
 * How well an entry answers the clauses, or 0 when it lacks one. Each clause
 * counts for the best place one of its forms is found, more again when the form
 * is a whole word and not the start of a longer one, and a little for each
 * further mention in the text. A headline holding the whole search as typed
 * counts most of all.
 */
export function score(entry: Entry, clauses: Clause[], fields: Fields = fieldsOf(entry)): number {
  if (clauses.length === 0) return 0;
  let total = 0;
  for (const clause of clauses) {
    let best = 0;
    for (const form of clause.forms) {
      for (const [field, weight] of Object.entries(WEIGHTS) as [keyof Fields, number][]) {
        const text = fields[field];
        if (!text.includes(` ${form}`)) continue;
        const whole = text.includes(` ${form} `) ? 1.5 : 1;
        const mentions = field === 'text' ? Math.log2(1 + count(text, form, 8)) : 1;
        best = Math.max(best, weight * whole * mentions);
      }
    }
    if (best === 0) return 0;
    total += best;
  }
  const typed = clauses.map((clause) => plain(clause.typed).trim()).join(' ');
  if (clauses.length > 1 && fields.title.includes(` ${typed} `)) total += WEIGHTS.title;
  return total;
}

export type Sort = 'best' | 'newest';

/** The entries that match, best first (newest first between equals), or newest first. */
export function search(index: Entry[], clauses: Clause[], sort: Sort = 'best'): Entry[] {
  return index
    .map((entry) => ({ entry, score: score(entry, clauses) }))
    .filter((found) => found.score > 0)
    .sort((a, b) => (sort === 'best' ? b.score - a.score : 0) || b.entry.date.localeCompare(a.entry.date) || a.entry.title.localeCompare(b.entry.title))
    .map((found) => found.entry);
}

/** The words to mark in a result: every form of every clause, as the text might write it. */
export function marks(clauses: Clause[]): string[] {
  return [...new Set(clauses.flatMap((clause) => clause.forms))].filter((form) => form.length > 1);
}

/**
 * A pattern that finds the marks in text as it is written, at the start of a
 * word. A space in a mark stands for any run of what `plain` makes a space, so
 * "username password" marks "username-password" too.
 */
export function markPattern(words: string[]): RegExp | null {
  if (words.length === 0) return null;
  const escaped = [...words].sort((a, b) => b.length - a.length).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '[^\\p{L}\\p{N}]+'));
  return new RegExp(`(?<![\\p{L}\\p{N}])(${escaped.join('|')})`, 'giu');
}

// Filters -----------------------------------------------------------------

/** How far back a search looks. */
export type When = 'any' | 'week' | 'month' | 'quarter' | 'between';
export const WHENS: { id: When; label: string; days?: number }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'week', label: 'Past week', days: 7 },
  { id: 'month', label: 'Past month', days: 30 },
  { id: 'quarter', label: 'Past 3 months', days: 91 },
  { id: 'between', label: 'Between' },
];

export interface Filters {
  kind: string[];
  show: string[];
  for: string[];
  section: string[];
  source: string[];
  when: When;
  /** The days a "Between" search runs from and to, YYYY-MM-DD, either left open. */
  from?: string;
  to?: string;
}

export type Group = 'kind' | 'show' | 'for' | 'section' | 'source';
export const GROUPS: Group[] = ['kind', 'show', 'for', 'section', 'source'];

export const noFilters = (): Filters => ({ kind: [], show: [], for: [], section: [], source: [], when: 'any' });

/** The first day a search looks at, or none. `today` is YYYY-MM-DD. */
export function since(filters: Filters, today: string): string | undefined {
  if (filters.when === 'between') return filters.from || undefined;
  const days = WHENS.find((when) => when.id === filters.when)?.days;
  if (!days) return undefined;
  return new Date(Date.parse(`${today}T12:00:00Z`) - (days - 1) * 86_400_000).toISOString().slice(0, 10);
}

/** Whether an entry is within the dates a search looks at. */
export function inDates(entry: Entry, filters: Filters, today: string): boolean {
  const from = since(filters, today);
  const to = filters.when === 'between' ? filters.to || undefined : undefined;
  return (!from || entry.date >= from) && (!to || entry.date <= to);
}

/** Whether an entry passes one group's ticked values. Nothing ticked lets everything through. Must-read stories are Recommended too, as on an edition. */
export function passes(group: Group, entry: Entry, values: string[]): boolean {
  if (values.length === 0) return true;
  switch (group) {
    case 'kind':
      return values.includes(entry.kind);
    case 'show':
      return values.some((value) => (value === 'must' ? entry.signal === 'must' : entry.signal !== 'other'));
    case 'for':
      return values.some((value) => entry.personas.includes(value));
    case 'section':
      // A section is a story's or a brief's; the Bulletin and release notes have none to filter by.
      return (entry.kind === 'story' || entry.kind === 'brief') && values.includes(entry.section);
    case 'source':
      return values.includes(entry.source);
  }
}

/** The entries that pass every filter, leaving out `except`'s group, so a box can say what ticking it would add. */
export function filtered(entries: Entry[], filters: Filters, today: string, except?: Group): Entry[] {
  return entries.filter((entry) => inDates(entry, filters, today) && GROUPS.every((group) => group === except || passes(group, entry, filters[group])));
}

/** How many results each value of a group would show, given every other filter. */
export function counts(entries: Entry[], filters: Filters, today: string, group: Group, values: string[]): Map<string, number> {
  const others = filtered(entries, filters, today, group);
  return new Map(values.map((value) => [value, others.filter((entry) => passes(group, entry, [value])).length]));
}

/** Whether any filter is set. */
export const filtering = (filters: Filters) => filters.when !== 'any' || GROUPS.some((group) => filters[group].length > 0);

// The address ---------------------------------------------------------------

/** The search and its filters as an address's query, so it can be reloaded or shared. Values are joined by commas, each one escaped. */
export function toParams(query: string, filters: Filters, sort: Sort): string {
  const params: string[] = [];
  const add = (key: string, value: string) => params.push(`${key}=${value}`);
  if (query) add('q', encodeURIComponent(query));
  if (!query) return params.join('&');
  for (const group of GROUPS) if (filters[group].length) add(group, filters[group].map(encodeURIComponent).join(','));
  if (filters.when !== 'any') add('when', filters.when);
  if (filters.when === 'between') {
    if (filters.from) add('from', filters.from);
    if (filters.to) add('to', filters.to);
  }
  if (sort !== 'best') add('sort', sort);
  return params.join('&');
}

/** The search and its filters from an address's query. */
export function fromParams(search: string): { query: string; filters: Filters; sort: Sort } {
  const raw = new Map(
    search
      .replace(/^\?/, '')
      .split('&')
      .filter(Boolean)
      .map((pair) => {
        const at = pair.indexOf('=');
        return at < 0 ? [pair, ''] : [pair.slice(0, at), pair.slice(at + 1)];
      }),
  );
  const decode = (value: string) => {
    try {
      return decodeURIComponent(value.replace(/\+/g, ' '));
    } catch {
      return value;
    }
  };
  const list = (key: string) => (raw.get(key) ?? '').split(',').filter(Boolean).map(decode);
  const day = (key: string) => (/^\d{4}-\d{2}-\d{2}$/.test(raw.get(key) ?? '') ? raw.get(key) : undefined);
  const when = WHENS.some((w) => w.id === raw.get('when')) ? (raw.get('when') as When) : 'any';
  const filters: Filters = { kind: list('kind'), show: list('show'), for: list('for'), section: list('section'), source: list('source'), when };
  if (when === 'between') {
    filters.from = day('from');
    filters.to = day('to');
  }
  return { query: decode(raw.get('q') ?? ''), filters, sort: raw.get('sort') === 'newest' ? 'newest' : 'best' };
}
