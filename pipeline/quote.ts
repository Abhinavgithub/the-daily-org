import fs from 'node:fs';
import path from 'node:path';
import type { Quote } from '../src/lib/quote';
import { QUOTE_PATH } from '../src/lib/quote-store';
import { USER_AGENT } from './http';

// The share price of the company the paper is about, at the last close. It is
// read once a day from Yahoo Finance's chart service, which asks for no key but
// is not a published service and can change without notice. So it is never a
// reason to stop: a price that cannot be read leaves the last one in place, and
// the page stops printing a price once it is some days old.

const TIMEOUT_MS = 20_000;

interface Chart {
  chart?: { result?: { meta?: { currency?: string; exchangeTimezoneName?: string }; timestamp?: number[]; indicators?: { quote?: { close?: (number | null)[] }[] } }[] };
}

const dayIn = (zone: string, at: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
const hourIn = (zone: string, at: Date) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', hourCycle: 'h23' }).format(at));

/**
 * The last close in a chart of daily prices, and how far it moved from the one
 * before. A day still being traded is not a close, and is left out.
 */
export function closeFrom(symbol: string, reply: Chart, now: Date): Quote | undefined {
  const result = reply.chart?.result?.[0];
  const zone = result?.meta?.exchangeTimezoneName ?? 'America/New_York';
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  let days = (result?.timestamp ?? []).map((at, i) => ({ day: dayIn(zone, new Date(at * 1000)), close: closes[i] })).filter((d): d is { day: string; close: number } => Number.isFinite(d.close));
  // Markets close in the late afternoon; before the evening, today's figure is not final.
  if (days.at(-1)?.day === dayIn(zone, now) && hourIn(zone, now) < 18) days = days.slice(0, -1);
  const [before, last] = days.slice(-2);
  if (!before || !last) return undefined;
  return { symbol, close: Number(last.close.toFixed(2)), change: Number((((last.close - before.close) / before.close) * 100).toFixed(2)), day: last.day, currency: result?.meta?.currency ?? 'USD' };
}

/** Read the price and save it. One that cannot be read leaves the file as it was. */
export async function updateQuote(symbol: string, options: { request?: typeof fetch; now?: Date; file?: string } = {}): Promise<{ quote: Quote } | { error: string }> {
  try {
    const res = await (options.request ?? fetch)(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=10d&interval=1d`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const quote = closeFrom(symbol, (await res.json()) as Chart, options.now ?? new Date());
    if (!quote) return { error: 'the reply held no two closing prices' };
    const file = options.file ?? QUOTE_PATH;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(quote, null, 2) + '\n');
    return { quote };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
