import type { AstroIntegration } from 'astro';

// Design previews: pages that show a feature before it is built, so it can be
// looked at on this machine. They are served by the dev server only and never
// reach the built site. Each one lives in src/preview/ and goes when its feature is built.

const PREVIEWS = [{ pattern: '/preview/feedback', entrypoint: './src/preview/feedback.astro' }];

export function previewDev(): AstroIntegration {
  return {
    name: 'preview-dev',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        for (const route of PREVIEWS) injectRoute({ ...route, prerender: true });
      },
    },
  };
}
