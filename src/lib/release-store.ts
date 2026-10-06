import fs from 'node:fs';
import path from 'node:path';
import { PAPER } from '../config';
import { DEFAULT_BAR, readEdition, type Edition } from './release-edition';

// The release editions on disk, for the pages that are built from them. This
// reads files, so it is for pages and never for a script that runs in the browser.

const DIR = path.join(process.cwd(), 'data', 'release-editions');

/** Every release edition, newest release first. */
export function getReleaseEditions(): Edition[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith('.json'))
    .flatMap((file) => {
      try {
        const edition = readEdition(JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')));
        return edition ? [edition] : [];
      } catch {
        return [];
      }
    })
    .sort((a, b) => b.release.number.localeCompare(a.release.number, 'en', { numeric: true }));
}

/** The fewest points a feature needs to be printed in this paper. */
export const BAR = PAPER.releaseNotes?.bar ?? DEFAULT_BAR;
