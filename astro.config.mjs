// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import paper from './paper.config.ts';
import { feedbackDev } from './pipeline/feedback-dev.ts';
import { previewDev } from './pipeline/preview-dev.ts';
import { verdictDev } from './pipeline/verdict-dev.ts';
import { reviewDev } from './pipeline/review-dev.ts';
import { INK } from './src/lib/theme.ts';

// The site's own address, used for absolute links in the RSS feed, the sitemap,
// robots.txt and link previews. It is the paper's `address` in paper.config.ts;
// SITE_URL, set on the host, takes its place when given. With neither, the
// site is taken to be running on this machine.
const site = (process.env.SITE_URL || paper.address || 'http://localhost:4321').replace(/\/+$/, '');

export default defineConfig({
  site,
  // The Logs page is for whoever runs the paper: it is built, but nothing links to it and it is left out of the sitemap.
  // feedbackDev lets the Logs page save flags under `npm run dev`; it adds nothing to the built site.
  // previewDev serves design previews under /preview/ with `npm run dev` only; they are never built.
  // reviewDev lets the review queue (/logs/review/) mark items done under `npm run dev`.
  // verdictDev takes readers' "Useful? Yes No" votes under `npm run dev`; on the live site the Worker in worker/ does.
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/logs') }), feedbackDev(), previewDev(), verdictDev(), reviewDev()],
  // Stories carry no code, and the highlighter's inline colours would need the policy below loosened.
  markdown: { syntaxHighlight: false },
  // A page of the paper's own is fetched as the pointer rests on a link to it, or as it is focused,
  // so it is usually there by the time it is pressed. Links that leave the paper are never fetched.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  security: {
    // Each page carries a Content Security Policy in a <meta> tag. Astro lists a hash of every script and style
    // it writes, so a script or style that someone slips into a page will not run. The policy is not checked
    // under `npm run dev`: try it with `npm run build && npm run preview`.
    // What the paper's own pages need besides their own files:
    // - Cloudflare Turnstile, the check under "Report an error": its script, its frame and its calls.
    // - `style="…"` on elements: the charts on the Stats and Logs pages set their bars' sizes that way.
    // frame-ancestors cannot be set in a <meta> tag, so it is sent as a header, in public/_headers.
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com",
        'frame-src https://challenges.cloudflare.com',
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", 'https://challenges.cloudflare.com'] },
      // Astro warns that 'self' does not reach style-src-attr. It is not meant to: attributes need only the line below.
      styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },
  vite: {
    // The paper's three colours, set in src/lib/theme.ts, reach the styles as Sass variables.
    css: { preprocessorOptions: { scss: { additionalData: `$paper: ${INK.paper}; $ink: ${INK.ink}; $accent: ${INK.accent};\n` } } },
  },
});
