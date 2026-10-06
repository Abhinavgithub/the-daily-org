import { sectionLabel } from '../config';
import { MAX_BRIEFS } from '../lib/editions';
import { formatDay, getAllStories, getBulletin, getEditions, getSignals, storyHref } from '../lib/stories';

// The whole archive as one static file for the search page to filter in the browser.
export async function GET() {
  const stories = await getAllStories();
  const signals = await getSignals();
  const index = stories.map((story) => ({
    href: storyHref(story),
    title: story.data.title,
    why: story.data.why_read,
    source: story.data.source,
    section: sectionLabel(story.data.section),
    day: formatDay(story.data.date, 'short'),
    // What the search page's filters go by.
    personas: story.data.personas,
    signal: signals.get(story.id) ?? 'other',
    text: [story.data.original_title ?? '', story.data.tags.join(' '), story.data.authors.join(' '), story.body ?? ''].join(' '),
  }));
  // The briefs each edition prints, found by their headline and the sentence under it. A result opens the edition at its "In brief" box.
  const briefs = (await getEditions()).flatMap((edition) =>
    edition.briefs.slice(0, MAX_BRIEFS).map((brief) => ({
      href: `/${edition.day}/#in-brief`,
      title: brief.data.title,
      why: brief.data.why_read,
      source: brief.data.source,
      section: sectionLabel(brief.data.section),
      day: formatDay(brief.data.date, 'short'),
      personas: brief.data.personas,
      // A brief is neither Recommended nor Must-read.
      signal: 'other' as const,
      text: brief.data.original_title ?? '',
      brief: true,
    })),
  );
  // What the Bulletin shows now. A result opens the Bulletin at that item; one that has left the page is not offered.
  const bulletin = (await getBulletin()).items.map((item) => ({
    href: `/bulletin/#${item.id.split('/').pop()}`,
    title: item.data.title,
    why: item.data.line,
    source: item.data.source,
    section: 'Bulletin',
    day: formatDay(item.data.date, 'short'),
    personas: [] as string[],
    signal: 'other' as const,
    text: [item.data.original_title ?? '', item.data.flag ?? '', item.body ?? ''].join(' '),
  }));
  return new Response(JSON.stringify([...index, ...briefs, ...bulletin]), { headers: { 'Content-Type': 'application/json' } });
}
