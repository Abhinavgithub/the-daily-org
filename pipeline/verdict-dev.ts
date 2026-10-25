import fs from 'node:fs';
import path from 'node:path';
import type { AstroIntegration } from 'astro';
import { jsonLines } from '../src/lib/jsonl';
import { applyVote, parseVote, readerHash, VERDICT_PATH, type VoteRow } from '../src/lib/verdict';

// Takes readers' votes while the paper runs on this machine, so "Useful? Yes No"
// can be tried before it goes live. On the live site the Worker in worker/ does
// the same into Cloudflare D1. Votes made here go to data/reader-feedback.jsonl,
// which git leaves out: the repository is public and votes are not.

export const VERDICT_FILE = path.join(process.cwd(), 'data', 'reader-feedback.jsonl');
const STORIES_DIR = path.join(process.cwd(), 'src', 'content', 'stories');

const load = (): VoteRow[] => (fs.existsSync(VERDICT_FILE) ? (jsonLines(fs.readFileSync(VERDICT_FILE, 'utf8')) as unknown as VoteRow[]) : []);
const save = (rows: VoteRow[]) => {
  fs.mkdirSync(path.dirname(VERDICT_FILE), { recursive: true });
  fs.writeFileSync(VERDICT_FILE, rows.map((row) => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
};

export function verdictDev(): AstroIntegration {
  return {
    name: 'verdict-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(VERDICT_PATH, (req, res) => {
          const reply = (status: number, body: object) => {
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
          };
          if (req.method !== 'POST') return reply(405, { error: 'Only POST is understood.' });
          if (!String(req.headers['content-type']).startsWith('application/json')) return reply(415, { error: 'Send JSON.' });
          let text = '';
          req.on('data', (chunk) => (text += chunk));
          req.on('end', async () => {
            let body: unknown;
            try {
              body = JSON.parse(text || 'null');
            } catch {
              return reply(400, { error: 'The request was not JSON.' });
            }
            const request = parseVote(body);
            if ('error' in request) return reply(400, request);
            if (!fs.existsSync(path.join(STORIES_DIR, `${request.story}.md`))) return reply(404, { error: 'That is not a story of this paper.' });
            const now = new Date();
            const who = await readerHash(req.socket.remoteAddress ?? '', 'dev', now.toISOString().slice(0, 10));
            try {
              const result = applyVote(load(), request, who, now);
              if (result.error) return reply(result.status, { error: result.error });
              save(result.rows);
              reply(200, { ok: true });
            } catch (error) {
              reply(500, { error: `The vote could not be saved: ${(error as Error).message}` });
            }
          });
        });
      },
    },
  };
}
