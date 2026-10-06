// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import paper from './paper.config.ts';
import { feedbackDev } from './pipeline/feedback-dev.ts';
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
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/logs') }), feedbackDev()],
  vite: {
    // The paper's three colours, set in src/lib/theme.ts, reach the styles as Sass variables.
    css: { preprocessorOptions: { scss: { additionalData: `$paper: ${INK.paper}; $ink: ${INK.ink}; $accent: ${INK.accent};\n` } } },
  },
});
