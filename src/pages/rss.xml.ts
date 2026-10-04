import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, sectionLabel } from '../config';
import { getEditions } from '../lib/stories';

export async function GET(context: APIContext) {
  const editions = await getEditions();
  const stories = editions.slice(0, 7).flatMap((edition) => edition.stories);

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: stories.map((story) => ({
      title: story.data.title,
      link: story.data.url,
      pubDate: new Date(`${story.data.date}T06:00:00Z`),
      description: story.data.why_read,
      author: story.data.authors.join(', ') || undefined,
      categories: [sectionLabel(story.data.section), ...story.data.tags],
    })),
  });
}
