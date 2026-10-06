import type { AstroIntegration } from 'astro';
import { applyRequest, loadFeedback, saveFeedback } from './feedback';

// Lets the Logs page save a flag while the paper runs on this machine. It is
// part of the dev server only: the built site is static files and has no such address.

export const FEEDBACK_PATH = '/__feedback';
const LOCAL = new Set(['localhost', '127.0.0.1', '[::1]']);
const local = (host: string | undefined) => {
  try {
    return host !== undefined && LOCAL.has(new URL(host.includes('://') ? host : `http://${host}`).hostname);
  } catch {
    return false;
  }
};

export function feedbackDev(): AstroIntegration {
  return {
    name: 'feedback-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(FEEDBACK_PATH, (req, res) => {
          const reply = (status: number, body: object) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
          };
          // Only a page served from this machine may write. A JSON body cannot be sent across sites without asking first.
          const origin = req.headers.origin;
          if (!local(req.headers.host) || (origin !== undefined && !local(origin)) || !String(req.headers['content-type']).startsWith('application/json')) {
            return reply(403, { error: 'Flags can only be saved from this machine.' });
          }
          let text = '';
          req.on('data', (chunk) => (text += chunk));
          req.on('end', () => {
            let body: unknown;
            try {
              body = JSON.parse(text || 'null');
            } catch {
              return reply(400, { error: 'The request was not JSON.' });
            }
            try {
              const result = applyRequest(req.method ?? '', body, loadFeedback());
              if (result.error) return reply(result.status, { error: result.error });
              saveFeedback(result.entries);
              reply(200, { ok: true });
            } catch (error) {
              reply(500, { error: `The flag could not be saved: ${(error as Error).message}` });
            }
          });
        });
      },
    },
  };
}
