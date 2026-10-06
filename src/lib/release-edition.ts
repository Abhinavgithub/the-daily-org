// A release edition: what matters in one release of the paper's subject, kept
// in the areas and products its release notes use. The pipeline builds one and
// saves it; this is what the page makes of it. Nothing here knows whose release it is.

/** One feature of a release. */
export interface Feature {
  /** The topic of the notes it comes from, which is where its name leads. */
  topic: string;
  /** The product it is filed under within its area, such as "Flow Builder". */
  product: string;
  name: string;
  /** One sentence, close to the notes' own words. */
  says: string;
  /** How much it matters to the paper's readers, from 1 to 10. */
  score: number;
}

export interface Area {
  name: string;
  topic: string;
  features: Feature[];
}

/** A change made in every org on a set day. */
export interface Enforced {
  topic: string;
  name: string;
  says: string;
  /** The section of the notes it stands under, such as "Enforced with This Release". */
  when: string;
  /** The day it takes hold, when the notes name one: "1 Dec 2026". */
  deadline?: string;
}

export interface Edition {
  /** The release's name, its maker's number for it, and its name in an address: "Winter '27", "264.0.0", "winter-27". */
  release: { name: string; number: string; slug: string };
  /** When the notes this was built from were last published. */
  notesPublished?: string;
  builtAt: string;
  model: string;
  /** Where a topic of these notes is read, with `{topic}` standing for the topic. */
  link: string;
  /** Where the notes themselves begin, for a reader who wants all of them. */
  notes?: string;
  areas: Area[];
  enforced: Enforced[];
}

/** The fewest points a feature needs to be printed, unless the paper says otherwise. */
export const DEFAULT_BAR = 8;
/** The most features set as headlines at the head of the edition. */
export const HEADLINES = 6;

export const linkTo = (edition: Edition, topic: string) => edition.link.replace('{topic}', topic);

/** The areas with the features that clear the bar, each area's features under their products, in the notes' order. */
export function printed(edition: Edition, bar = DEFAULT_BAR): { name: string; topic: string; count: number; products: { name: string; features: Feature[] }[] }[] {
  return edition.areas
    .map((area) => {
      const products: { name: string; features: Feature[] }[] = [];
      for (const feature of area.features.filter((f) => f.score >= bar)) {
        let product = products.find((p) => p.name === feature.product);
        if (!product) products.push((product = { name: feature.product, features: [] }));
        product.features.push(feature);
      }
      return { name: area.name, topic: area.topic, count: products.reduce((sum, p) => sum + p.features.length, 0), products };
    })
    .filter((area) => area.count > 0);
}

/**
 * The features set as headlines: the highest scoring, and among equals one from
 * each area in turn, so that the head of the edition is not all one area.
 */
export function headlines(edition: Edition, bar = DEFAULT_BAR, most = HEADLINES): (Feature & { area: string })[] {
  const all = edition.areas.flatMap((area) => area.features.filter((f) => f.score >= bar).map((f) => ({ ...f, area: area.name })));
  const top = Math.max(0, ...all.map((f) => f.score));
  const chosen: (Feature & { area: string })[] = [];
  for (let score = top; score >= bar && chosen.length < most; score--) {
    const level = all.filter((f) => f.score === score);
    // One from each area, then a second from each, and so on.
    const byArea = edition.areas.map((area) => level.filter((f) => f.area === area.name));
    for (let round = 0; chosen.length < most && byArea.some((list) => list.length > round); round++) {
      for (const list of byArea) if (list[round] && chosen.length < most) chosen.push(list[round]);
    }
  }
  return chosen;
}

/**
 * The changes that take hold with this release, and not the ones only scheduled
 * or called off. Those with a day named come first, the soonest at the head;
 * the rest follow in the notes' own order.
 */
export function enforcedNow(edition: Edition): Enforced[] {
  const day = (change: Enforced) => (change.deadline && Date.parse(change.deadline)) || Number.MAX_SAFE_INTEGER;
  return edition.enforced.filter((change) => /^enforced with this release/i.test(change.when)).sort((a, b) => day(a) - day(b));
}

/** Whatever was saved, read as an edition, or nothing when it is not one. */
export function readEdition(raw: unknown): Edition | undefined {
  const edition = raw as Partial<Edition> | null;
  if (!edition || typeof edition !== 'object' || !edition.release?.name || !edition.release.slug || !Array.isArray(edition.areas)) return undefined;
  return { model: '', link: '', builtAt: '', ...edition, areas: edition.areas.filter((area) => area && Array.isArray(area.features)), enforced: Array.isArray(edition.enforced) ? edition.enforced : [] } as Edition;
}

/** Whether a line of text has every word of what was typed, in any order and any case. */
export function matches(text: string, typed: string): boolean {
  const have = text.toLowerCase();
  return typed
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => have.includes(word));
}
