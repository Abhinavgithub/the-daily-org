import { definePaper, youtube } from '../src/paper';

// This file is the paper. Change it to change what the paper is called, what it
// covers and where it reads from; nothing else in the project names a subject.
// `npm run check-paper` tries every source and reports what it finds.
//
// What follows is a small working example about space science. Replace it with
// your own subject.

export default definePaper({
  // The nameplate at the top of every page, and the line beneath it.
  name: 'The Orbit Gazette',
  tagline: 'A Space Science Newspaper',
  // One sentence for search engines and the RSS feed.
  description: 'A daily newspaper of the space science stories worth reading, scored and summarised.',
  // Shown as "Curated by ..." under the nameplate.
  creator: { name: 'Your Name', url: 'https://example.com' },
  // Decides which day an edition belongs to. Use a name from the tz database, such as "Europe/London".
  timezone: 'UTC',

  // How the editor is told what the paper is about. Each of these four is
  // dropped into a sentence, shown beside it, so write it to read well there.
  // "a newspaper about <topic>"
  topic: 'space science and exploration',
  // "a daily newspaper for <readers>"
  readers: 'people who follow space science closely',
  // "True only if the item <relevant>."
  relevant: 'reports a result, a mission event or a technical explanation in astronomy, planetary science or spaceflight',
  // "False for <notRelevant>."
  notRelevant: 'press releases with no substance, staff announcements, merchandise, and anything not about space',
  // Optional. Printed in the footer as "<name> is an independent project, <disclaimer>."
  disclaimer: 'not affiliated with any space agency',

  // Every story is filed under one section. Ids are lower case with hyphens and
  // are stored in each story, so prefer adding a section to renaming one.
  sections: [
    { id: 'missions', label: 'Missions' },
    { id: 'astronomy', label: 'Astronomy' },
    { id: 'planetary-science', label: 'Planetary science' },
    { id: 'technology', label: 'Technology' },
  ],

  // Kinds of reader a story can be marked for; readers can filter by them.
  // Leave the list empty, [], to do without.
  personas: [
    { id: 'enthusiast', label: 'Enthusiasts' },
    { id: 'researcher', label: 'Researchers' },
  ],

  // The feeds the paper reads. Each needs a unique id, the feed's address (RSS
  // or Atom, not the site's home page) and a type: official, community, code,
  // discussion or video.
  //   noisy: true     the feed mixes in off-topic posts; keep only items that mention one of `keywords`
  //   personas: [...] a hint to the editor about who the source writes for
  //   ...youtube('UC...')   a YouTube channel, by its channel id, in place of `url`
  sources: [
    { id: 'nasa', name: 'NASA', url: 'https://www.nasa.gov/feed/', type: 'official' },
    { id: 'esa-science', name: 'ESA Space Science', url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science', type: 'official', personas: ['researcher'] },
    { id: 'planetary-society', name: 'The Planetary Society', url: 'https://www.planetary.org/rss/articles', type: 'community', noisy: true },
    // { id: 'yt-example', name: 'An example channel', ...youtube('UCxxxxxxxxxxxxxxxxxxxxxx'), type: 'video' },
  ],

  // Optional. An item from a noisy source is kept only if one of these appears
  // in it. Each is matched as a whole word, in any case.
  keywords: ['telescope', 'orbit', 'mission', 'spacecraft', 'planet', 'galaxy', 'launch', 'rover'],

  // Optional. Names the paper always writes one way, whatever the source does.
  // List only unambiguous names; give the singular.
  glossary: ['James Webb Space Telescope', 'Hubble', 'NASA', 'ESA'],

  // Optional. Extra rules for the writer, one sentence each.
  houseStyle: ['Give distances and sizes in metric units.'],

  // Optional. The paper's three colours, as hex colours. Leave any out to keep the default.
  // colours: { paper: '#f1ebdd', ink: '#1c1a16', accent: '#8f4a08' },

  // Optional. Words that mark a byline as an organisation, not a person.
  notAuthors: ['nasa', 'esa'],

  // How the pipeline names itself to the sites it reads. Sites can refuse readers
  // that do not say who they are, so give a real address where you can be reached.
  bot: { name: 'OrbitGazetteBot', contact: 'https://example.com' },
});

// Not used until a YouTube source is added above.
void youtube;
