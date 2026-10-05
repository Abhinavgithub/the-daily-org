// What makes one paper different from another: its name, its subject, its
// sources. A paper is described once, in paper.config.ts at the top of the
// project, and everything else reads it from there.
//
// Keep this file free of Astro imports: the pipeline uses it too.

export const SOURCE_TYPES = ['official', 'community', 'code', 'discussion', 'video'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export interface Source<Persona extends string = string> {
  /** Short and unique, in lower case with hyphens. It names the feed in files and logs. */
  id: string;
  name: string;
  /** The address of the RSS or Atom feed. */
  url: string;
  type: SourceType;
  /** Noisy feeds mix in marketing or off-topic posts and must pass the paper's keyword check. */
  noisy?: boolean;
  /** A hint for the model, not a constraint. */
  personas?: Persona[];
  /** Other addresses for the same feed, tried when the main one fails. */
  alternatives?: string[];
  /** For a YouTube source: its channel ID, used to read it through the YouTube API when a key is set. */
  youtubeChannel?: string;
}

export interface Paper<Section extends string = string, Persona extends string = string> {
  /** The nameplate, as printed at the top of every page. */
  name: string;
  /** The line under the nameplate. */
  tagline: string;
  /** One sentence for search engines and the RSS feed. */
  description: string;
  creator: { name: string; url: string };
  /** Decides which day an edition belongs to, for example "Europe/London". */
  timezone: string;

  /** The subject, as it reads in "a newspaper about ...". */
  topic: string;
  /** Who the paper is written for, as it reads in "a daily newspaper for ...". */
  readers: string;
  /** What earns an item its place, as it reads in "True only if the item ...". */
  relevant: string;
  /** What is turned away, as it reads in "False for ...". */
  notRelevant: string;
  /** Printed in the footer as "<name> is an independent project, <disclaimer>." */
  disclaimer?: string;

  /** The paper's sections. Every story is filed under one. */
  sections: readonly { id: Section; label: string }[];
  /** Kinds of reader a story can be marked for. Leave empty to do without. */
  personas: readonly { id: Persona; label: string }[];
  sources: readonly Source<Persona>[];

  /** Words that show an item from a noisy source is on topic. */
  keywords?: readonly string[];
  /** Names with a fixed spelling and capitalisation, which the paper always writes this way. */
  glossary?: readonly string[];
  /** Extra rules for the writer, one sentence each. */
  houseStyle?: readonly string[];
  /** Words that mark a byline as not a person, such as the company the paper covers. */
  notAuthors?: readonly string[];
  /**
   * The three colours the paper is printed in, as hex colours: the sheet, the
   * ink, and one accent. They set the light theme and the colours illustrations
   * are asked for in; the dark theme's shades are in src/styles/main.scss.
   */
  colours?: { paper?: string; ink?: string; accent?: string };
  /** Where the paper is published, such as "https://example.com". Used for links in the RSS feed, sitemap and link previews. */
  address?: string;
  /** Optional. Where the paper's code is kept, such as a GitHub repository. Linked from the footer of every page. */
  repository?: string;
  /** How the pipeline names itself to the sites it reads. `contact` is a web address where its owner can be reached. */
  bot: { name: string; contact: string };
}

// YouTube's feed endpoint fails at random. A channel's uploads playlist (the same
// ID with UU for UC) carries the same videos and fails independently, so it is
// worth having as a second address.
/** The feed addresses of a YouTube channel, to spread into a source. */
export const youtube = (channelId: string) => ({
  youtubeChannel: channelId,
  url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  alternatives: [`https://www.youtube.com/feeds/videos.xml?playlist_id=UU${channelId.slice(2)}`],
});

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Everything wrong with a paper, in words its owner can act on. Empty when it is sound. */
export function problemsWith(paper: Paper): string[] {
  const problems: string[] = [];
  const need = (value: unknown, field: string) => {
    if (typeof value !== 'string' || !value.trim()) problems.push(`"${field}" is empty.`);
  };
  need(paper.name, 'name');
  need(paper.tagline, 'tagline');
  need(paper.description, 'description');
  need(paper.topic, 'topic');
  need(paper.readers, 'readers');
  need(paper.relevant, 'relevant');
  need(paper.notRelevant, 'notRelevant');
  need(paper.bot?.name, 'bot.name');
  need(paper.bot?.contact, 'bot.contact');
  try {
    new Intl.DateTimeFormat('en', { timeZone: paper.timezone });
  } catch {
    problems.push(`"timezone" is not a known time zone: ${paper.timezone}. Use a name such as "Europe/London".`);
  }

  for (const [role, colour] of Object.entries(paper.colours ?? {})) {
    if (!/^#[0-9a-f]{6}$/i.test(colour ?? '')) problems.push(`The colour "${role}" must be a hex colour such as #f1ebdd, got "${colour}".`);
  }

  const ids = (list: readonly { id: string }[], what: string) => {
    const seen = new Set<string>();
    for (const { id } of list) {
      if (!ID.test(id)) problems.push(`The ${what} id "${id}" must be lower-case letters and digits joined by hyphens.`);
      if (seen.has(id)) problems.push(`Two ${what}s share the id "${id}".`);
      seen.add(id);
    }
    return seen;
  };
  if (!paper.sections?.length) problems.push('"sections" needs at least one section.');
  ids(paper.sections ?? [], 'section');
  const personas = ids(paper.personas ?? [], 'persona');
  if (!paper.sources?.length) problems.push('"sources" needs at least one source.');
  ids(paper.sources ?? [], 'source');
  for (const source of paper.sources ?? []) {
    if (!/^https?:\/\//.test(source.url)) problems.push(`The source "${source.id}" needs a web address, got "${source.url}".`);
    if (!SOURCE_TYPES.includes(source.type)) problems.push(`The source "${source.id}" has the type "${source.type}"; use one of ${SOURCE_TYPES.join(', ')}.`);
    for (const persona of source.personas ?? []) {
      if (!personas.has(persona)) problems.push(`The source "${source.id}" names the persona "${persona}", which is not in "personas".`);
    }
    if (source.noisy && !paper.keywords?.length) problems.push(`The source "${source.id}" is marked noisy, but the paper has no "keywords" to check it against.`);
  }
  return problems;
}

/**
 * Describe a paper. The section and persona ids are remembered as written, so
 * the editor can point out a source that names a persona the paper does not have.
 */
export function definePaper<const Section extends string, const Persona extends string>(paper: Paper<Section, Persona>): Paper<Section, Persona> {
  const problems = problemsWith(paper as unknown as Paper);
  if (problems.length) throw new Error(`paper.config.ts needs attention:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  return paper;
}
