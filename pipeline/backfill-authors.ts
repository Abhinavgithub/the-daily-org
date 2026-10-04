import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { extractPage } from './extract';
import { STORIES_DIR } from './write';

// Re-reads each story's page for its writers and updates `authors` where the
// page names someone different from what was stored. Makes no model calls.
const files = fs
  .readdirSync(STORIES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .map((f) => path.join(STORIES_DIR, f));

let changed = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) continue;
  const doc = parseDocument(match[1]);
  const { url, title, source_type, authors: stored = [] } = doc.toJS() as {
    url?: string;
    title?: string;
    source_type?: string;
    authors?: string[];
  };
  if (!url || source_type === 'video') continue;

  let found: string[];
  try {
    found = (await extractPage(url)).authors;
  } catch (err) {
    console.log(`  Could not read the page (${(err as Error).message}): ${title}`);
    continue;
  }
  if (found.length === 0 || found.join('|') === stored.join('|')) continue;

  doc.set('authors', found);
  fs.writeFileSync(file, raw.replace(match[0], () => `---\n${doc.toString({ lineWidth: 0 }).trimEnd()}\n---\n`));
  changed++;
  console.log(`  ${stored.join(', ') || '(none)'} -> ${found.join(', ')}: ${title}`);
}
console.log(`Updated ${changed} of ${files.length} stor${files.length === 1 ? 'y' : 'ies'}.`);
