import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AstroIntegration } from 'astro';
import { jsonLines } from '../src/lib/jsonl';
import { applyVote, parseReport, parseVote, readerHash, REPORT_PATH, reportAllowed, splitFeedback, VERDICT_PATH, voteDay, type ReportRow, type VoteRow } from '../src/lib/verdict';

// Takes readers' votes and reports while the paper runs on this machine, so they
// can be tried before they go live, and lets the Logs page mark a report as dealt
// with. On the live site the Worker in worker/ takes them into Cloudflare D1, and
// `npm run reader-feedback` brings those here. Both kinds go to data/reader-feedback.jsonl,
// which git leaves out: the repository is public and readers' notes are not.

export const READER_FILE = path.join(process.cwd(), 'data', 'reader-feedback.jsonl');
/** The ids of the reports the editor has dealt with, kept apart so that pulling the live ones again does not undo it. */
export const HANDLED_FILE = path.join(process.cwd(), 'data', 'reader-feedback-handled.json');
export const HANDLED_PATH = '/__reader-handled';
const STORIES_DIR = path.join(process.cwd(), 'src', 'content', 'stories');

export function loadReaderFeedback(): { votes: VoteRow[]; reports: ReportRow[] } {
  return splitFeedback(fs.existsSync(READER_FILE) ? jsonLines(fs.readFileSync(READER_FILE, 'utf8')) : []);
}

export function saveReaderFeedback(votes: VoteRow[], reports: ReportRow[]): void {
  const lines = [...votes.map((row) => ({ kind: 'vote', ...row })), ...reports.map((row) => ({ kind: 'report', ...row }))];
  fs.mkdirSync(path.dirname(READER_FILE), { recursive: true });
  fs.writeFileSync(READER_FILE, lines.map((line) => JSON.stringify(line)).join('\n') + (lines.length ? '\n' : ''));
}

export function loadHandled(): string[] {
  try {
    const ids = JSON.parse(fs.readFileSync(HANDLED_FILE, 'utf8'));
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

const reply = (res: ServerResponse, status: number, body: object) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

/** The request's JSON body, or undefined once it has been answered with what was wrong. */
function readJson(req: IncomingMessage, res: ServerResponse): Promise<unknown> {
  return new Promise((resolve) => {
    if (req.method !== 'POST') return resolve(reply(res, 405, { error: 'Only POST is understood.' }));
    if (!String(req.headers['content-type']).startsWith('application/json')) return resolve(reply(res, 415, { error: 'Send JSON.' }));
    let text = '';
    req.on('data', (chunk) => (text += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(text || 'null') ?? null);
      } catch {
        resolve(reply(res, 400, { error: 'The request was not JSON.' }));
      }
    });
  });
}

const printed = (story: string) => fs.existsSync(path.join(STORIES_DIR, `${story}.md`));
const reader = (req: IncomingMessage, now: Date) => readerHash(req.socket.remoteAddress ?? '', 'dev', voteDay(now));

export function verdictDev(): AstroIntegration {
  return {
    name: 'verdict-dev',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(VERDICT_PATH, async (req, res) => {
          const body = await readJson(req, res);
          if (body === undefined) return;
          const request = parseVote(body);
          if ('error' in request) return reply(res, 400, request);
          if (!printed(request.story)) return reply(res, 404, { error: 'That is not a story of this paper.' });
          const now = new Date();
          try {
            const { votes, reports } = loadReaderFeedback();
            const result = applyVote(votes, request, await reader(req, now), now);
            if (result.error) return reply(res, result.status, { error: result.error });
            saveReaderFeedback(result.rows, reports);
            reply(res, 200, { ok: true });
          } catch (error) {
            reply(res, 500, { error: `The vote could not be saved: ${(error as Error).message}` });
          }
        });

        server.middlewares.use(REPORT_PATH, async (req, res) => {
          const body = await readJson(req, res);
          if (body === undefined) return;
          const request = parseReport(body);
          if ('error' in request) return reply(res, 400, request);
          if (request.trap) return reply(res, 200, { ok: true });
          if (!printed(request.story)) return reply(res, 404, { error: 'That is not a story of this paper.' });
          // Turnstile is not asked on this machine: its check only answers for the paper's own address.
          const now = new Date();
          const day = voteDay(now);
          const who = await reader(req, now);
          try {
            const { votes, reports } = loadReaderFeedback();
            const allowed = reportAllowed(reports.filter((row) => row.who === who && row.day === day));
            if (allowed.error) return reply(res, allowed.status, { error: allowed.error });
            const row: ReportRow = { id: `dev-${now.getTime()}`, story: request.story, part: request.part, note: request.note, day, who, at: now.toISOString() };
            saveReaderFeedback(votes, [...reports, row]);
            reply(res, 200, { ok: true });
          } catch (error) {
            reply(res, 500, { error: `The report could not be saved: ${(error as Error).message}` });
          }
        });

        // The Logs page marks a report as dealt with, or takes that back.
        server.middlewares.use(HANDLED_PATH, async (req, res) => {
          // Only a page served from this machine may change it.
          const origin = req.headers.origin;
          if (origin && !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)) return reply(res, 403, { error: 'Only from this machine.' });
          const body = (await readJson(req, res)) as { id?: unknown; handled?: unknown } | null | undefined;
          if (body === undefined) return;
          if (typeof body?.id !== 'string' || typeof body.handled !== 'boolean') return reply(res, 400, { error: 'Send a report id and whether it is dealt with.' });
          const ids = new Set(loadHandled());
          if (body.handled) ids.add(body.id);
          else ids.delete(body.id);
          fs.mkdirSync(path.dirname(HANDLED_FILE), { recursive: true });
          fs.writeFileSync(HANDLED_FILE, JSON.stringify([...ids], null, 2) + '\n');
          reply(res, 200, { ok: true });
        });
      },
    },
  };
}
