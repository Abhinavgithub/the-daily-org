import { sectionLabel } from '../config';
import { formatDay, getAllStories, getSignals, storyHref } from '../lib/stories';

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
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json' } });
}
