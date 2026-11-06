import { sectionLabel } from '../config';
import { deadlineId, deadlinesFrom } from '../lib/deadlines';
import { MAX_BRIEFS } from '../lib/editions';
import { printed } from '../lib/release-edition';
import { BAR, getReleaseEditions } from '../lib/release-store';
import type { Entry } from '../lib/search';
import { formatDay, getAllStories, getBulletin, getEditions, getSignals, storyHref } from '../lib/stories';

// The whole archive as one static file for the search page to match, rank and
// filter in the browser (see src/lib/search.ts): stories, briefs, what the
// Bulletin shows now, and the release notes the paper has read.
export async function GET() {
  const signals = await getSignals();
  const stories: Entry[] = (await getAllStories()).map((story) => ({
    href: storyHref(story),
    kind: 'story',
    title: story.data.title,
    why: story.data.why_read,
    source: story.data.source,
    section: sectionLabel(story.data.section),
    date: story.data.date,
    day: formatDay(story.data.date, 'short'),
    tags: [story.data.original_title ?? '', ...story.data.tags].join(' '),
    text: [story.data.authors.join(' '), story.body ?? ''].join(' '),
    personas: story.data.personas,
    signal: signals.get(story.id) ?? 'other',
  }));

  // The briefs each edition prints. A result opens the edition at its "In brief" box. A brief is neither Recommended nor Must-read.
  const briefs: Entry[] = (await getEditions()).flatMap((edition) =>
    edition.briefs.slice(0, MAX_BRIEFS).map((brief) => ({
      href: `/${edition.day}/#in-brief`,
      kind: 'brief' as const,
      title: brief.data.title,
      why: brief.data.why_read,
      source: brief.data.source,
      section: sectionLabel(brief.data.section),
      date: brief.data.date,
      day: formatDay(brief.data.date, 'short'),
      tags: brief.data.original_title ?? '',
      text: '',
      personas: brief.data.personas,
      signal: 'other' as const,
    })),
  );

  // What the Bulletin shows now. A result opens the Bulletin at that item; one that has left the page is not offered.
  const bulletin: Entry[] = (await getBulletin()).items.map((item) => ({
    href: `/bulletin/#${item.id.split('/').pop()}`,
    kind: 'bulletin',
    title: item.data.title,
    why: item.data.line ?? '',
    source: item.data.source,
    section: 'Bulletin',
    date: item.data.date,
    day: formatDay(item.data.date, 'short'),
    tags: [item.data.original_title ?? '', item.data.flag ?? ''].join(' '),
    text: item.body ?? '',
    personas: [],
    signal: 'other',
  }));

  // The release notes: each feature a release edition prints, which opens that edition searched for it,
  // and each change a release enforces, which opens its card on the Deadlines page.
  const editions = getReleaseEditions();
  const features: Entry[] = editions.flatMap((edition) => {
    const date = (edition.notesPublished ?? edition.builtAt).slice(0, 10);
    return printed(edition, BAR).flatMap((area) =>
      area.products.flatMap((product) =>
        product.features.map((feature) => ({
          href: `/releases/${edition.release.slug}/?q=${encodeURIComponent(feature.name)}`,
          kind: 'release' as const,
          title: feature.name,
          why: feature.says,
          source: `${edition.release.name} release notes`,
          section: 'Release notes',
          date,
          day: formatDay(date, 'short'),
          where: `${edition.release.name} · ${product.name === area.name ? area.name : `${area.name} › ${product.name}`}`,
          tags: '',
          text: '',
          personas: [],
          signal: 'other' as const,
        })),
      ),
    );
  });
  const published = new Map(editions.map((edition) => [edition.release.name, (edition.notesPublished ?? edition.builtAt).slice(0, 10)]));
  const updates: Entry[] = deadlinesFrom(editions).map((update) => {
    const date = published.get(update.from) ?? '';
    return {
      href: `/deadlines/#${deadlineId(update.topic)}`,
      kind: 'release',
      title: update.name,
      why: update.says,
      source: `${update.from} release notes`,
      section: 'Release notes',
      date,
      day: date && formatDay(date, 'short'),
      where: `${update.from} · Release update${update.deadline ? `, from ${update.deadline}` : ''}`,
      tags: (update.phrases ?? []).join(' '),
      text: update.action ?? '',
      personas: update.roles ?? [],
      signal: 'other',
    };
  });

  return new Response(JSON.stringify([...stories, ...briefs, ...bulletin, ...features, ...updates]), { headers: { 'Content-Type': 'application/json' } });
}
