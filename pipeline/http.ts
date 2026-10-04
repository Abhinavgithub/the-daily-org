// How the pipeline identifies itself to the sites it reads: a name, a version
// and a contact address, as well-behaved crawlers do. Some sites refuse
// clients that claim to be a browser but accept a declared bot. The name and
// address are the paper's `bot`, in paper.config.ts.
import { PAPER } from '../src/config';

export const USER_AGENT = `${PAPER.bot.name}/0.1 (+${PAPER.bot.contact})`;

/** A GET with the pipeline's identity and a time limit. */
export function get(
  url: string,
  accept: string,
  timeoutMs = 20_000,
  headers: Record<string, string> = {},
): Promise<Response> {
  return fetch(url, {
    headers: { ...headers, 'User-Agent': USER_AGENT, Accept: accept },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: 'follow',
  });
}
