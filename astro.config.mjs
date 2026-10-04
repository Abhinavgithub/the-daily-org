// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { INK } from './src/lib/theme.ts';

// The site's own address, used for absolute links in the RSS feed, the sitemap,
// robots.txt and link previews. The host sets SITE_URL (see "Going live" in the
// README); without it the site is taken to be running on this machine.
const site = (process.env.SITE_URL || 'http://localhost:4321').replace(/\/+$/, '');

export default defineConfig({
  site,
  // The Logs page is for whoever runs the paper: it is built, but nothing links to it and it is left out of the sitemap.
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/logs') })],
  vite: {
    // The paper's three colours, set in src/lib/theme.ts, reach the styles as Sass variables.
    css: { preprocessorOptions: { scss: { additionalData: `$paper: ${INK.paper}; $ink: ${INK.ink}; $accent: ${INK.accent};\n` } } },
  },
});
