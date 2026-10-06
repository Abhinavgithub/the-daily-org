import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { addFeedback, FEEDBACK_KINDS, loadFeedback, normalizeUrl, saveFeedback, summarize, type Feedback, type FeedbackKind } from './feedback';

// Tell the paper what it got wrong. It reads and writes data/feedback.jsonl only.
//
//   npm run feedback -- junk <article address> [--note "why"]
//   npm run feedback -- missed <article address> [--title "..."] [--source <id>] [--note "why"]
//   npm run feedback -- list

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: { note: { type: 'string' }, title: { type: 'string' }, source: { type: 'string' } },
});
const [command, address] = positionals;

/** What a printed story says about itself, found by its address. */
function printedStory(url: string): Partial<Feedback> {
  const root = path.join(process.cwd(), 'src', 'content', 'stories');
  if (!fs.existsSync(root)) return {};
  for (const file of fs.readdirSync(root, { recursive: true }).map(String).filter((f) => f.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    const field = (name: string) => text.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim().replace(/^["']|["']$/g, '');
    const found = field('url');
    if (!found || normalizeUrl(found) !== url) continue;
    return { title: field('title'), source: field('source'), section: field('section'), interest: Number(field('interest_score')) || undefined };
  }
  return {};
}

if (command === 'list') {
  const entries = loadFeedback();
  const { junk, missed, bySource } = summarize(entries);
  console.log(`${entries.length} entries: ${junk} junk, ${missed} missed.`);
  for (const [source, row] of Object.entries(bySource)) console.log(`  ${source}: ${row.junk} junk, ${row.missed} missed`);
  for (const e of entries.slice(-10)) console.log(`${e.at.slice(0, 10)}  ${e.kind.padEnd(6)} ${e.title ?? e.url}${e.note ? `  (${e.note})` : ''}`);
} else if (FEEDBACK_KINDS.includes(command as FeedbackKind) && address) {
  let url: string;
  try {
    url = normalizeUrl(address);
  } catch {
    console.error(`"${address}" is not an address.`);
    process.exit(1);
  }
  const printed = printedStory(url);
  if (command === 'junk' && !printed.title) console.warn('Not found among the printed stories; recording the address alone.');
  if (command === 'missed' && printed.title) {
    console.error(`"${printed.title}" was printed, so it was not missed. Use junk if it should not have been.`);
    process.exit(1);
  }
  const entry: Feedback = { at: new Date().toISOString(), kind: command as FeedbackKind, url, ...printed };
  if (args.title) entry.title = args.title;
  if (args.source) entry.source = args.source;
  if (args.note) entry.note = args.note;
  saveFeedback(addFeedback(loadFeedback(), entry));
  console.log(`Recorded as ${command}: ${entry.title ?? url}`);
} else {
  console.error('Usage: npm run feedback -- junk|missed <article address> [--note "why"]\n       npm run feedback -- list');
  process.exit(1);
}
