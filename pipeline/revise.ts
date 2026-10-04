import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { parseDocument } from 'yaml';
import { proofread, type Copy } from './curate';
import { configFromEnv, keepFreeModels, LlmClient } from './llm';
import { applyGlossary, sentenceCase } from './style';
import { STORIES_DIR } from './write';

// Brings already-published stories up to the current standard: a headline
// written for the paper, proof-read text, and house-style capitalisation.
//
//   npm run revise                    stories that still carry the article's own title
//   npm run revise -- --glossary-only every story, capitalisation only, no model calls

const { values: args } = parseArgs({
  options: { 'glossary-only': { type: 'boolean', default: false }, model: { type: 'string' } },
});
const glossaryOnly = args['glossary-only'];

const files = fs
  .readdirSync(STORIES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => path.join(STORIES_DIR, f));

let llm: LlmClient | undefined;
if (!glossaryOnly) {
  const config = configFromEnv({ model: args.model });
  if (!config.apiKey) {
    console.error('LLM_API_KEY is not set. Use --glossary-only to fix capitalisation without the model.');
    process.exit(1);
  }
  const { models, notes } = await keepFreeModels(config, process.env.LLM_ALLOW_PAID === '1');
  for (const note of notes) console.warn(`  ${note}`);
  if (models.length === 0) {
    console.error('No usable model left. Run `npm run models` to pick a free one.');
    process.exit(1);
  }
  llm = new LlmClient({ ...config, models, log: (message) => console.warn(`      extra call, ${message}`) });
}

/** Print what changed in one field, paragraph by paragraph. */
function show(label: string, before: string, after: string) {
  if (before === after) return;
  const was = before.split(/\n\s*\n/);
  const now = after.split(/\n\s*\n/);
  was.forEach((paragraph, i) => {
    if (paragraph === now[i]) return;
    console.log(`    ${label}${was.length > 1 ? ` (paragraph ${i + 1})` : ''}`);
    console.log(`      before: ${paragraph}`);
    console.log(`      after:  ${now[i] ?? '(removed)'}`);
  });
}

let changed = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n\n?([\s\S]*)$/);
  if (!match) continue;
  const doc = parseDocument(match[1]);
  const data = doc.toJS() as { title: string; original_title?: string; why_read: string };
  const before: Copy = { title: data.title, why_read: data.why_read, summary: match[2].trim() };

  let after: Copy;
  let note = '';
  if (llm && !data.original_title) {
    const result = await proofread(llm, before, { newHeadline: true });
    after = result.copy;
    if (result.reason) note = ` (not all of the model's version was used: ${result.reason})`;
    // A story is only marked as revised when the model actually produced its headline.
    if (result.usable) {
      doc.set('original_title', before.title);
      // Keep the two titles together at the top of the file.
      const items = doc.contents && 'items' in doc.contents ? (doc.contents.items as { key: { value: string } }[]) : [];
      const from = items.findIndex((pair) => pair.key.value === 'original_title');
      const to = items.findIndex((pair) => pair.key.value === 'title') + 1;
      if (from > to) items.splice(to, 0, items.splice(from, 1)[0]);
    }
  } else {
    after = {
      // Only headlines written for the paper are re-cased; an article's own title is left as its author set it.
      title: applyGlossary(data.original_title ? sentenceCase(before.title, before.summary) : before.title),
      why_read: applyGlossary(before.why_read),
      summary: applyGlossary(before.summary),
    };
  }

  const same = after.title === before.title && after.why_read === before.why_read && after.summary === before.summary;
  if (same && !doc.has('original_title')) {
    if (note) console.log(`  Unchanged${note}: ${before.title}`);
    continue;
  }
  if (same && data.original_title) continue;

  doc.set('title', after.title);
  doc.set('why_read', after.why_read);
  fs.writeFileSync(file, `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n\n${after.summary}\n`);
  changed++;
  console.log(`\n  ${path.basename(file)}${note}`);
  show('headline', before.title, after.title);
  show('reason to read', before.why_read, after.why_read);
  show('summary', before.summary, after.summary);
}

console.log(`\nRevised ${changed} of ${files.length} stor${files.length === 1 ? 'y' : 'ies'}.${llm ? ` ${llm.calls} model calls.` : ''}`);
