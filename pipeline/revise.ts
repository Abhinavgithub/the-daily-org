import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { withCorrection, fixStory } from './correct';
import { proofread, type Copy } from './curate';
import { articleText } from './extract';
import { configFromEnv, LlmClient, modelsOrStop } from './llm';
import { applyGlossary, sentenceCase } from './style';
import { loadReaderFeedback, markHandled } from './verdict-dev';
import { openStory, STORIES_DIR, storyText } from './write';

// Brings already-published stories up to the current standard: a headline
// written for the paper, proof-read text, and house-style capitalisation.
//
//   npm run revise                    stories that still carry the article's own title
//   npm run revise -- --glossary-only every story, capitalisation only, no model calls
//   npm run revise -- --story 2026-10-04/some-story
//                                     one story, proof-read again whatever it carries
//
// And corrects a story a reader has reported (PLAN.md, step 8c). The model reads
// the article, judges the report by it, and if it is right fixes only what was
// wrong and writes the correction printed under the story:
//
//   npm run revise -- --report <id>   a report from the Logs page (/logs/#readers), which is then dealt with
//   npm run revise -- --story 2026-10-04/some-story --hint "the limit is 50, not 100"

const { values: args } = parseArgs({
  options: {
    'glossary-only': { type: 'boolean', default: false },
    model: { type: 'string' },
    story: { type: 'string' },
    report: { type: 'string' },
    hint: { type: 'string' },
  },
});
const glossaryOnly = args['glossary-only'];

const report = args.report ? loadReaderFeedback().reports.find((row) => row.id === args.report) : undefined;
if (args.report && !report) {
  console.error(`No report "${args.report}" in data/reader-feedback.jsonl. Run \`npm run reader-feedback\` to bring in the live site's.`);
  process.exit(1);
}
const only = report?.story ?? args.story;
const hint = report ? { part: report.part, note: report.note } : args.hint !== undefined ? { part: 'Something else', note: args.hint } : undefined;
if (hint && !only) {
  console.error('--hint goes with --story, to say which story it is about.');
  process.exit(1);
}
if (hint && glossaryOnly) {
  console.error('A correction needs the model, so it does not go with --glossary-only.');
  process.exit(1);
}

const files = only
  ? [path.join(STORIES_DIR, `${only.replace(/\.md$/, '')}.md`)]
  : fs
      .readdirSync(STORIES_DIR, { recursive: true, encoding: 'utf8' })
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => path.join(STORIES_DIR, f));
if (only && !fs.existsSync(files[0])) {
  console.error(`No story ${only}: its file would be ${path.relative(process.cwd(), files[0])}.`);
  process.exit(1);
}

let llm: LlmClient | undefined;
if (!glossaryOnly) {
  const config = configFromEnv({ model: args.model });
  const models = await modelsOrStop(config, {
    noKey: 'LLM_API_KEY is not set. Use --glossary-only to fix capitalisation without the model.',
    noModel: 'No usable model left. Run `npm run models` to pick a free one.',
  });
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

if (hint && llm) {
  const file = files[0];
  const story = openStory(fs.readFileSync(file, 'utf8'))!;
  const data = story.doc.toJS() as { title: string; why_read: string; url: string };
  const before: Copy = { title: data.title, why_read: data.why_read, summary: story.body.trim() };
  console.log(`${data.title}\n  Report (${hint.part}): ${hint.note || 'no note'}`);
  const article = await articleText(data.url);
  if (!article) console.log('  The article could not be read, so only a mistake the story makes against itself can be found.');
  const fix = await fixStory(llm, before, { ...hint, article });
  if (fix.outcome !== 'fixed') {
    console.log(`\n  Not corrected: ${fix.reason}.`);
    console.log('  If it is wrong all the same, edit the story and print a correction from the Logs page.');
    process.exit(fix.outcome === 'skipped' ? 1 : 0);
  }
  story.doc.set('title', fix.copy.title);
  story.doc.set('why_read', fix.copy.why_read);
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(file, withCorrection(storyText(story.doc, `\n${fix.copy.summary}\n`), { date: today, text: fix.correction }));
  if (report) markHandled(report.id);
  console.log('');
  show('headline', before.title, fix.copy.title);
  show('reason to read', before.why_read, fix.copy.why_read);
  show('summary', before.summary, fix.copy.summary);
  console.log(`    correction, printed under the story\n      ${fix.correction}`);
  console.log(`\nCorrected ${path.relative(process.cwd(), file)}${report ? ', and the report is dealt with' : ''}. See it with \`git diff\`; \`git checkout -- <file>\` takes it back.`);
  process.exit(0);
}

let changed = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const story = openStory(raw);
  if (!story) continue;
  const { doc } = story;
  const data = doc.toJS() as { title: string; original_title?: string; why_read: string };
  const before: Copy = { title: data.title, why_read: data.why_read, summary: story.body.trim() };

  let after: Copy;
  let note = '';
  // One story named is proof-read again even when its headline is already the paper's own.
  if (llm && (!data.original_title || only)) {
    const result = await proofread(llm, before, { newHeadline: !data.original_title });
    after = result.copy;
    if (result.reason) note = ` (not all of the model's version was used: ${result.reason})`;
    // A story is only marked as revised when the model actually produced its headline.
    if (result.usable && !data.original_title) {
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
  fs.writeFileSync(file, storyText(doc, `\n${after.summary}\n`));
  changed++;
  console.log(`\n  ${path.basename(file)}${note}`);
  show('headline', before.title, after.title);
  show('reason to read', before.why_read, after.why_read);
  show('summary', before.summary, after.summary);
}

console.log(`\nRevised ${changed} of ${files.length} stor${files.length === 1 ? 'y' : 'ies'}.${llm ? ` ${llm.calls} model calls.` : ''}`);
