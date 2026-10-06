import fs from 'node:fs';
import path from 'node:path';
import { create } from 'fontkitten';
import sharp from 'sharp';
import { PAPER } from '../src/config';
import { INK, NAMEPLATE_ACCENT } from '../src/lib/theme';

// Draws the site's icons: one blackletter capital from the nameplate's own
// typeface, in the paper's ink on its newsprint. Where the nameplate prints a
// word in colour, the icon is that word's letter in that colour. Run it again
// after changing the paper's name or colours.
//
//   npm run favicon          the coloured word's first letter, or the name's, leaving out "The"
//   npm run favicon -- H     another letter

const PUBLIC = path.join(process.cwd(), 'public');
const letter = (process.argv[2] ?? PAPER.accent?.trim()[0] ?? PAPER.name.replace(/^(the|a|an)\s+/i, '').trim()[0] ?? 'N').toUpperCase();
// The coloured word's letter keeps its colour on a dark browser too; an ink letter turns to paper there.
const coloured = Boolean(PAPER.accent);
const fill = coloured ? NAMEPLATE_ACCENT : INK.ink;

// A font file can hold several faces. The nameplate's holds one; were it to hold more, the first is the one meant.
const file = create(fs.readFileSync(path.join(PUBLIC, 'fonts', 'Chomsky.woff2')));
const font = 'fonts' in file ? file.fonts[0] : file;
const glyph = font.glyphForCodePoint(letter.codePointAt(0)!);
const { minX, minY, maxX, maxY } = glyph.bbox;
if (!(maxX > minX && maxY > minY)) throw new Error(`The nameplate font has no "${letter}".`);

/** The icon as an SVG on a 64-unit square. `inset` is the room left around the letter. */
function icon(options: { inset: number; border: boolean; adaptive: boolean }): string {
  const scale = (64 - options.inset * 2) / Math.max(maxX - minX, maxY - minY);
  // The font's y axis runs upward, the picture's downward.
  const x = 32 - (scale * (minX + maxX)) / 2;
  const y = 32 + (scale * (minY + maxY)) / 2;
  const dark = options.adaptive ? `<style>@media (prefers-color-scheme: dark){.p{fill:${INK.ink}}.i{fill:${INK.paper}}.b{stroke:${INK.paper}}}</style>` : '';
  const border = options.border ? `<rect class="b" x="2" y="2" width="60" height="60" fill="none" stroke="${INK.ink}" stroke-width="4"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${dark}<rect class="p" width="64" height="64" fill="${INK.paper}"/>${border}<path${coloured ? '' : ' class="i"'} fill="${fill}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(5)} ${(-scale).toFixed(5)})" d="${glyph.path.toSVG()}"/></svg>\n`;
}

const png = (svg: string, size: number) => sharp(Buffer.from(svg), { density: 72 * (size / 64) * 4 }).resize(size, size).png().toBuffer();

/** An .ico file holding one PNG, which every current browser reads. */
function ico(image: Buffer, size: number): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); // an icon
  header.writeUInt16LE(1, 4); // one picture
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(image.length, 14);
  header.writeUInt32LE(22, 18); // where the picture starts
  return Buffer.concat([header, image]);
}

// The tab icon keeps its border, one pixel wide at the smallest size, and follows a dark browser. The larger icons are
// cropped to a circle or rounded square by the phone, so they have no border and more room.
const tab = icon({ inset: 8, border: true, adaptive: true });
const plain = icon({ inset: 8, border: true, adaptive: false });
const app = icon({ inset: 14, border: false, adaptive: false });

fs.writeFileSync(path.join(PUBLIC, 'favicon.svg'), tab);
fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), ico(await png(plain, 32), 32));
fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), await png(app, 180));
fs.writeFileSync(path.join(PUBLIC, 'icon-192.png'), await png(app, 192));
fs.writeFileSync(path.join(PUBLIC, 'icon-512.png'), await png(app, 512));
fs.writeFileSync(
  path.join(PUBLIC, 'site.webmanifest'),
  JSON.stringify(
    {
      name: PAPER.name,
      short_name: PAPER.name,
      description: PAPER.description,
      start_url: '/',
      display: 'browser',
      background_color: INK.paper,
      theme_color: INK.paper,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log(`Icons drawn with the letter ${letter}: favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest.`);
