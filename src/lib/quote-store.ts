import fs from 'node:fs';
import path from 'node:path';
import { readQuote, type Quote } from './quote';

// The saved share price, for the pages built from it. This reads a file, so it
// is for pages and never for a script that runs in the browser.

export const QUOTE_PATH = path.join(process.cwd(), 'data', 'quote.json');

export function getQuote(today = new Date().toISOString().slice(0, 10)): Quote | undefined {
  try {
    return readQuote(JSON.parse(fs.readFileSync(QUOTE_PATH, 'utf8')), today);
  } catch {
    return undefined;
  }
}
