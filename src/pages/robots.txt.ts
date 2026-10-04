import type { APIContext } from 'astro';

// Search engines may read everything but the Logs page, which is for whoever runs the paper.
export function GET(context: APIContext) {
  const sitemap = new URL('/sitemap-index.xml', context.site);
  return new Response(`User-agent: *\nDisallow: /logs/\n\nSitemap: ${sitemap}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
