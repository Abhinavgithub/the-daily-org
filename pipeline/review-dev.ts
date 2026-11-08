import fs from 'node:fs';
import path from 'node:path';
import type { AstroIntegration } from 'astro';
import { markDone, readDone } from '../src/lib/review';
import { fromHere, readJson, reply } from './verdict-dev';

// Lets the review queue (/logs/review/) mark an item done while the paper runs on this machine. Part of the dev
// server only: the built site is static files and has no such address. What is done is kept in data/review.json,
// by item id, with when (src/lib/review.ts says what an id names).

export const REVIEW_PATH = '/__review';
export const REVIEW_FILE = path.join(process.cwd(), 'data', 'review.json');

export function loadDone(file = REVIEW_FILE) {
  return readDone(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
}

/** Marks an item done, or takes that back, and saves the record. */
export function saveDone(id: string, done: boolean, file = REVIEW_FILE, now = new Date()): void {
  const after = markDone(loadDone(file), id, done, now);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // One item to a line, in the order of their ids, so a commit shows what was dealt with.
  const sorted = Object.fromEntries(Object.entries(after).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(file, JSON.stringify(sorted, null, 2) + '\n');
}

export function reviewDev(): AstroIntegration {
  return {
    name: 'review-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(REVIEW_PATH, async (req, res) => {
          if (!fromHere(req)) return reply(res, 403, { error: 'Only from this machine.' });
          const body = (await readJson(req, res)) as { id?: unknown; done?: unknown } | null | undefined;
          if (body === undefined) return;
          if (typeof body?.id !== 'string' || !/^[a-z-]+:/.test(body.id) || body.id.length > 600 || typeof body.done !== 'boolean') {
            return reply(res, 400, { error: 'Send an item id and whether it is done.' });
          }
          try {
            saveDone(body.id, body.done);
            reply(res, 200, { ok: true });
          } catch (error) {
            reply(res, 500, { error: `Not saved: ${(error as Error).message}` });
          }
        });
      },
    },
  };
}
