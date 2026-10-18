import fs from 'node:fs';
import path from 'node:path';
import { extractImage } from './extract';
import { openStory, STORIES_DIR, storyText } from './write';

// Adds an `image` line to stories that have none. Makes no model calls.
const files = fs
  .readdirSync(STORIES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .map((f) => path.join(STORIES_DIR, f));

let added = 0;
let missing = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const story = openStory(raw);
  if (!story) continue;
  const data = story.doc.toJS() as { url?: string; image?: string; title?: string };
  if (data.image || !data.url) continue;

  const image = await extractImage(data.url);
  if (!image) {
    missing++;
    console.log(`  No image found: ${data.title}`);
    continue;
  }
  story.doc.set('image', image);
  fs.writeFileSync(file, storyText(story.doc, story.body));
  added++;
  console.log(`  Added image: ${data.title}`);
}
console.log(`Added ${added} image${added === 1 ? '' : 's'}. ${missing} stor${missing === 1 ? 'y has' : 'ies have'} none.`);
