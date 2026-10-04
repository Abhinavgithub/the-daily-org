import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { extractImage } from './extract';
import { STORIES_DIR } from './write';

// Adds an `image` line to stories that have none. Makes no model calls.
const files = fs
  .readdirSync(STORIES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .map((f) => path.join(STORIES_DIR, f));

let added = 0;
let missing = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) continue;
  const data = parse(match[1]) as { url?: string; image?: string; title?: string };
  if (data.image || !data.url) continue;

  const image = await extractImage(data.url);
  if (!image) {
    missing++;
    console.log(`  No image found: ${data.title}`);
    continue;
  }
  fs.writeFileSync(file, raw.replace(match[0], () => `---\n${match[1]}\nimage: ${JSON.stringify(image)}\n---\n`));
  added++;
  console.log(`  Added image: ${data.title}`);
}
console.log(`Added ${added} image${added === 1 ? '' : 's'}. ${missing} stor${missing === 1 ? 'y has' : 'ies have'} none.`);
