// A story's diagram drawn as SVG by code, from the checked figure stored in the
// story's file. Every node and label in the figure is drawn exactly once, the
// lettering is real text, and the colours are the page's own, so the picture
// follows the reader's light or dark theme.
//
// Each figure has two layouts: one across, for a wide box, and one stacked,
// for a single column or a phone. The page shows whichever fits its box.

import type { Figure } from './figure';
import { ICONS, type IconName } from './icons';
import { LETTERS, WIDTHS } from './letter-widths';

export type Drawn = Exclude<Figure, { kind: 'none' }>;
export type Layout = 'wide' | 'narrow';

/** The page's colours. On the page they come from its stylesheet; a picture made outside it passes its own. */
export interface Palette {
  /** Fill of a box, so the lines behind it are hidden. */
  surface: string;
  ink: string;
  /** The paper's one accent colour. */
  accent: string;
  /** The page behind the drawing, or nothing to leave it clear. */
  background?: string;
}

export const PAGE: Palette = { surface: 'var(--surface)', ink: 'var(--ink)', accent: 'var(--sun)' };

const FONT = `'Libre Franklin', 'Franklin Gothic Medium', 'Helvetica Neue', Arial, sans-serif`;
const LEAD = 1.25;
const SIZE = 15;
const PAD = 8;
const WIDTH: Record<Layout, number> = { wide: 720, narrow: 360 };
/** From this many steps the wide drawing is one long row, this wide. */
export const LONG_FROM = 6;
const LONG_WIDTH = 1160;
/** Whether a figure's wide drawing is the long row, which needs a story the width of the page. */
export const isLong = (figure: Drawn) => figure.kind === 'steps' && figure.steps.length >= LONG_FROM;

/**
 * The narrowest story, in rem, in which the drawing across is shown; narrower, the stacked one is. A row of steps
 * needs about 9rem a box for its words to keep to two or three lines, so four and five steps wait for more room.
 */
export function wideFrom(figure: Drawn): 36 | 42 | 52 | 60 {
  if (figure.kind === 'timeline') {
    // A timeline's columns are as narrow as a row of steps, but no box is drawn round them.
    const n = figure.events.length;
    return n >= 5 ? 52 : n === 4 ? 42 : 36;
  }
  if (figure.kind !== 'steps') return 36;
  const n = figure.steps.length;
  return n >= LONG_FROM ? 60 : n === 5 ? 52 : n === 4 ? 42 : 36;
}

/** A figure as a value is printed: a leading hyphen is a true minus sign, the width and height of the plus. */
export const value = (text: string) => text.replace(/^-(?=[\d$£€.])/, '\u2212');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Each letter's width at the two weights the drawing uses, from the font itself (letter-widths.ts). A letter not
// measured counts as wide as an "n". Lines are kept a little short of their room, for the kerning the browser adds
// and for a picture drawn where the font is missing (the edition's social card).
const MEASURED = { 500: new Map<string, number>(), 700: new Map<string, number>() };
[...LETTERS].forEach((letter, i) => {
  MEASURED[500].set(letter, WIDTHS[500][i]);
  MEASURED[700].set(letter, WIDTHS[700][i]);
});
const SLACK = 0.95;
type Weight = 500 | 700;

/** How wide `line` is when set at `size`, in the drawing's units. */
export function measure(line: string, size = SIZE, weight: Weight = 500): number {
  const widths = MEASURED[weight];
  let total = 0;
  for (const letter of line) total += widths.get(letter) ?? widths.get('n')!;
  return (total * size) / 1000;
}

/** Words into lines, each as full as it will go within `width`. */
function fill(words: string[], width: number, size: number, weight: Weight): string[] {
  const lines: string[] = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (last !== undefined && measure(`${last} ${word}`, size, weight) <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/**
 * Break a label into lines that fit `width` at `size`, at spaces, measured with the font's own letter widths. A word
 * longer than a line is broken with a hyphen. The lines are then balanced, as a headline is: the label keeps the
 * fewest lines it needs, each about as long as the others, so no word is left on a line of its own.
 */
export function wrap(label: string, width: number, size = SIZE, weight: Weight = 500): string[] {
  const room = width * SLACK;
  const words = label
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => {
      const pieces: string[] = [];
      while (measure(word, size, weight) > room && word.length > 2) {
        let cut = word.length - 1;
        while (cut > 1 && measure(`${word.slice(0, cut)}-`, size, weight) > room) cut--;
        pieces.push(`${word.slice(0, cut)}-`);
        word = word.slice(cut);
      }
      return [...pieces, word];
    });
  const lines = fill(words, room, size, weight);
  if (lines.length < 2) return lines;
  // The narrowest measure that still needs no more lines.
  let narrow = Math.max(...words.map((word) => measure(word, size, weight)));
  let wide = room;
  for (let i = 0; i < 12; i++) {
    const mid = (narrow + wide) / 2;
    if (fill(words, mid, size, weight).length <= lines.length) wide = mid;
    else narrow = mid;
  }
  return fill(words, wide, size, weight);
}

const height = (lines: string[], size = SIZE) => lines.length * size * LEAD;

/** Lines of text whose block starts at `top`. */
function text(x: number, top: number, lines: string[], fill: string, options: { size?: number; weight?: number; anchor?: 'start' | 'middle' } = {}): string {
  const { size = SIZE, weight = 500, anchor = 'middle' } = options;
  const lead = size * LEAD;
  return `<text x="${r(x)}" y="${r(top + lead / 2)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central">${lines
    .map((line, i) => `<tspan x="${r(x)}" dy="${i === 0 ? 0 : r(lead)}">${esc(line)}</tspan>`)
    .join('')}</text>`;
}

const r = (n: number) => Math.round(n * 10) / 10;

function icon(name: IconName | undefined, cx: number, cy: number, size: number, colour: string): string {
  if (!name || !ICONS[name]) return '';
  const scale = size / 24;
  return `<path d="${ICONS[name]}" transform="translate(${r(cx - size / 2)} ${r(cy - size / 2)}) scale(${r(scale * 100) / 100})" fill="none" stroke="${colour}" stroke-width="${r(1.8 / scale)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const box = (x: number, y: number, w: number, h: number, p: Palette, fill = p.surface, stroke = p.ink) =>
  `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;

const badge = (cx: number, cy: number, n: number, p: Palette) =>
  `<circle cx="${r(cx)}" cy="${r(cy)}" r="11" fill="${p.accent}"/>${text(cx, cy - (13 * LEAD) / 2, [String(n)], p.surface, { size: 13, weight: 700 })}`;

const arrow = (x1: number, y1: number, x2: number, y2: number, p: Palette) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = (t: number) => `${r(x2 - 7 * Math.cos(a + t))} ${r(y2 - 7 * Math.sin(a + t))}`;
  return `<path d="M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}M${head(0.6)}L${r(x2)} ${r(y2)}L${head(-0.6)}" fill="none" stroke="${p.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
};

const icons = (figure: Drawn) => (figure.icons ?? []) as (IconName | undefined)[];

/** A drawing and the height it takes; the width is the layout's unless it says otherwise. */
type Drawing = { body: string; height: number; width?: number };

function steps(figure: Extract<Drawn, { kind: 'steps' }>, layout: Layout, p: Palette): Drawing {
  const W = WIDTH[layout];
  const pictures = icons(figure);
  const n = figure.steps.length;
  const ICON = 26;
  if (layout === 'wide' && n > LONG_FROM - 1) {
    // Six or seven steps: one row of smaller boxes, without pictures, drawn wider so the words keep their size.
    // It is shown only in a story wide enough for it (see .fig--long in _figure.scss).
    const W = LONG_WIDTH;
    const gap = 18;
    const w = (W - 2 * PAD - (n - 1) * gap) / n;
    const lines = figure.steps.map((step) => wrap(step, w - 18));
    const tallest = Math.max(...lines.map((l) => height(l)));
    const h = 14 + 22 + 8 + tallest + 14;
    const body = figure.steps
      .map((_, i) => {
        const shorter = (tallest - height(lines[i])) / 2;
        const x = PAD + i * (w + gap);
        return (
          box(x, PAD, w, h, p) +
          badge(x + w / 2, PAD + 14 + 11, i + 1, p) +
          text(x + w / 2, PAD + 14 + 22 + 8 + shorter, lines[i], p.ink) +
          (i < n - 1 ? arrow(x + w + 3, PAD + h / 2, x + w + gap - 3, PAD + h / 2, p) : '')
        );
      })
      .join('');
    return { body, height: h + 2 * PAD, width: W };
  }
  if (layout === 'wide') {
    const gap = 30;
    const w = (W - 2 * PAD - (n - 1) * gap) / n;
    const lines = figure.steps.map((step) => wrap(step, w - 20));
    const iconBand = pictures.some(Boolean) ? ICON + 10 : 0;
    const tallest = Math.max(...lines.map((l) => height(l)));
    const h = 14 + 22 + iconBand + tallest + 14;
    const body = figure.steps
      .map((_, i) => {
        // A short label sits in the middle of the room left for the tallest.
        const shorter = (tallest - height(lines[i])) / 2;
        const x = PAD + i * (w + gap);
        const top = PAD;
        return (
          box(x, top, w, h, p) +
          badge(x + w / 2, top + 14 + 11, i + 1, p) +
          icon(pictures[i], x + w / 2, top + 14 + 22 + 6 + ICON / 2, ICON, p.ink) +
          text(x + w / 2, top + 14 + 22 + iconBand + 4 + shorter, lines[i], p.ink) +
          (i < n - 1 ? arrow(x + w + 5, top + h / 2, x + w + gap - 5, top + h / 2, p) : '')
        );
      })
      .join('');
    return { body, height: h + 2 * PAD };
  }
  const gap = 24;
  const w = W - 2 * PAD;
  const textLeft = 14 + 22 + 12 + (pictures.some(Boolean) ? ICON + 12 : 0);
  let y = PAD;
  const body = figure.steps
    .map((step, i) => {
      const lines = wrap(step, w - textLeft - 12);
      const h = Math.max(48, height(lines) + 24);
      const out =
        box(PAD, y, w, h, p) +
        badge(PAD + 14 + 11, y + h / 2, i + 1, p) +
        icon(pictures[i], PAD + 14 + 22 + 12 + ICON / 2, y + h / 2, ICON, p.ink) +
        text(PAD + textLeft, y + (h - height(lines)) / 2, lines, p.ink, { anchor: 'start' }) +
        (i < n - 1 ? arrow(PAD + 25, y + h + 4, PAD + 25, y + h + gap - 4, p) : '');
      y += h + gap;
      return out;
    })
    .join('');
  return { body, height: y - gap + PAD };
}

function parts(figure: Extract<Drawn, { kind: 'parts' }>, layout: Layout, p: Palette): Drawing {
  const W = WIDTH[layout];
  const pictures = icons(figure);
  const ICON = 28;
  const iconBand = pictures.some(Boolean) ? ICON + 8 : 0;

  if (layout === 'wide') {
    const n = figure.parts.length;
    const cw = 176;
    const lines = figure.parts.map((part) => wrap(part, cw - 20));
    const tallest = Math.max(...lines.map((l) => height(l)));
    const ch = 14 + iconBand + tallest + 14;
    const hubLines = wrap(figure.whole, 170, 19, 700);
    const hw = 200;
    const hh = height(hubLines, 19) + 28;
    const rx = W / 2 - PAD - cw / 2;
    // Spread evenly round an ellipse, from the top left, so three parts sit left, right and below rather than in a column.
    const angles = figure.parts.map((_, i) => -Math.PI / 2 - Math.PI / n + (i * 2 * Math.PI) / n);
    // Tall enough that no part above or below the whole touches it.
    const ry = Math.max(110, ...angles.filter((a) => Math.abs(Math.sin(a)) > 0.6).map((a) => (ch / 2 + hh / 2 + 22) / Math.abs(Math.sin(a))));
    const nodes = angles.map((a) => ({ x: W / 2 + rx * Math.cos(a), y: ry * Math.sin(a) }));
    const top = Math.min(-hh / 2, ...nodes.map((node) => node.y - ch / 2)) - PAD;
    const bottom = Math.max(hh / 2, ...nodes.map((node) => node.y + ch / 2)) + PAD;
    const cy = -top;
    const spokes = nodes.map((node) => `<line x1="${W / 2}" y1="${r(cy)}" x2="${r(node.x)}" y2="${r(cy + node.y)}" stroke="${p.accent}" stroke-width="2.5"/>`).join('');
    const cards = nodes
      .map((node, i) => {
        const x = node.x - cw / 2;
        // Each card's picture and words sit together in its middle.
        const y = cy + node.y - ch / 2 + (tallest - height(lines[i])) / 2;
        return box(x, cy + node.y - ch / 2, cw, ch, p) + icon(pictures[i], node.x, y + 14 + ICON / 2, ICON, p.ink) + text(node.x, y + 14 + iconBand, lines[i], p.ink);
      })
      .join('');
    // The whole is reversed out of ink, as a flag is: the heaviest mark, with the paper's colour left for the spokes.
    const hub = box(W / 2 - hw / 2, cy - hh / 2, hw, hh, p, p.ink, p.ink) + text(W / 2, cy - height(hubLines, 19) / 2, hubLines, p.surface, { size: 19, weight: 700 });
    return { body: spokes + cards + hub, height: bottom - top };
  }

  // Stacked: the whole above, its parts below on a stem down the left.
  const hubLines = wrap(figure.whole, W - 2 * PAD - 24, 18, 700);
  const hh = height(hubLines, 18) + 24;
  const stem = PAD + 18;
  const left = stem + 18;
  const w = W - PAD - left;
  const gap = 10;
  const textLeft = 14 + (pictures.some(Boolean) ? ICON + 12 : 0);
  let y = PAD + hh + 16;
  const branches: number[] = [];
  const cards = figure.parts
    .map((part, i) => {
      const lines = wrap(part, w - textLeft - 12);
      const h = Math.max(46, height(lines) + 22);
      branches.push(y + h / 2);
      const out = box(left, y, w, h, p) + icon(pictures[i], left + 14 + ICON / 2, y + h / 2, ICON, p.ink) + text(left + textLeft, y + (h - height(lines)) / 2, lines, p.ink, { anchor: 'start' });
      y += h + gap;
      return out;
    })
    .join('');
  const lines =
    `<path d="M${stem} ${PAD + hh}V${r(branches.at(-1)!)}${branches.map((b) => `M${stem} ${r(b)}H${left}`).join('')}" fill="none" stroke="${p.accent}" stroke-width="2.5"/>`;
  const hub = box(PAD, PAD, W - 2 * PAD, hh, p, p.ink, p.ink) + text(W / 2, PAD + 12, hubLines, p.surface, { size: 18, weight: 700 });
  return { body: lines + hub + cards, height: y - gap + PAD };
}

function compare(figure: Extract<Drawn, { kind: 'compare' }>, layout: Layout, p: Palette): Drawing {
  const W = WIDTH[layout];
  const pictures = icons(figure);
  const ICON = 24;
  const sides = [figure.left, figure.right];
  const gap = layout === 'wide' ? 36 : 0;
  const w = layout === 'wide' ? (W - 2 * PAD - gap) / 2 : W - 2 * PAD;

  /** One side, its top at `y`: its heading with a rule under it, then its points. */
  const side = (s: (typeof sides)[number], picture: IconName | undefined, x: number, y: number): Drawing => {
    const headLeft = picture ? ICON + 10 : 0;
    const head = wrap(s.heading, w - headLeft, 16, 700);
    const headH = Math.max(height(head, 16), picture ? ICON : 0);
    let out = icon(picture, x + ICON / 2, y + headH / 2, ICON, p.accent) + text(x + headLeft, y + (headH - height(head, 16)) / 2, head, p.accent, { size: 16, weight: 700, anchor: 'start' });
    let at = y + headH + 8;
    out += `<line x1="${r(x)}" y1="${r(at)}" x2="${r(x + w)}" y2="${r(at)}" stroke="${p.ink}" stroke-width="1.5"/>`;
    at += 12;
    for (const point of s.points) {
      const lines = wrap(point, w - 18);
      out += `<rect x="${r(x + 1)}" y="${r(at + (SIZE * LEAD) / 2 - 3)}" width="6" height="6" fill="${p.ink}"/>` + text(x + 18, at, lines, p.ink, { anchor: 'start' });
      at += height(lines) + 10;
    }
    return { body: out, height: at - 10 - y };
  };

  if (layout === 'wide') {
    const drawn = sides.map((s, i) => side(s, pictures[i], PAD + i * (w + gap), PAD));
    const h = Math.max(...drawn.map((d) => d.height));
    const divide = `<line x1="${W / 2}" y1="${PAD}" x2="${W / 2}" y2="${r(PAD + h)}" stroke="${p.ink}" stroke-width="1" stroke-dasharray="3 4"/>`;
    return { body: drawn.map((d) => d.body).join('') + divide, height: h + 2 * PAD };
  }
  const first = side(sides[0], pictures[0], PAD, PAD);
  const mid = PAD + first.height + 22;
  const versus = `<line x1="${PAD}" y1="${r(mid)}" x2="${W - PAD}" y2="${r(mid)}" stroke="${p.ink}" stroke-width="1" stroke-dasharray="3 4"/>`;
  const second = side(sides[1], pictures[1], PAD, mid + 22);
  return { body: first.body + versus + second.body, height: mid + 22 + second.height + PAD };
}

function numbers(figure: Extract<Drawn, { kind: 'numbers' }>, layout: Layout, p: Palette): Drawing {
  const W = WIDTH[layout];
  const pictures = icons(figure);
  const ICON = 30;
  const VALUE = 34;
  const n = figure.numbers.length;
  if (layout === 'wide') {
    const gap = 24;
    const w = (W - 2 * PAD - (n - 1) * gap) / n;
    const iconBand = pictures.some(Boolean) ? ICON + 10 : 0;
    const labels = figure.numbers.map((num) => wrap(num.label, w - 16, 14));
    const h = iconBand + VALUE * LEAD + 6 + Math.max(...labels.map((l) => height(l, 14)));
    const body = figure.numbers
      .map((num, i) => {
        const cx = PAD + i * (w + gap) + w / 2;
        const rule = i > 0 ? `<line x1="${r(cx - w / 2 - gap / 2)}" y1="${PAD}" x2="${r(cx - w / 2 - gap / 2)}" y2="${r(PAD + h)}" stroke="${p.ink}" stroke-width="1" stroke-dasharray="3 4"/>` : '';
        return (
          rule +
          icon(pictures[i], cx, PAD + ICON / 2, ICON, p.ink) +
          text(cx, PAD + iconBand, [value(num.value)], p.accent, { size: VALUE, weight: 700 }) +
          text(cx, PAD + iconBand + VALUE * LEAD + 6, labels[i], p.ink, { size: 14 })
        );
      })
      .join('');
    return { body, height: h + 2 * PAD };
  }
  let y = PAD;
  const textLeft = PAD + (pictures.some(Boolean) ? ICON + 14 : 0);
  const body = figure.numbers
    .map((num, i) => {
      const labels = wrap(num.label, W - PAD - textLeft, 14);
      const h = VALUE * LEAD + height(labels, 14);
      const out =
        (i > 0 ? `<line x1="${PAD}" y1="${r(y - 9)}" x2="${W - PAD}" y2="${r(y - 9)}" stroke="${p.ink}" stroke-width="1" stroke-dasharray="3 4"/>` : '') +
        icon(pictures[i], PAD + ICON / 2, y + h / 2, ICON, p.ink) +
        text(textLeft, y, [value(num.value)], p.accent, { size: VALUE, weight: 700, anchor: 'start' }) +
        text(textLeft, y + VALUE * LEAD, labels, p.ink, { size: 14, anchor: 'start' });
      y += h + 18;
      return out;
    })
    .join('');
  return { body, height: y - 18 + PAD };
}

function timeline(figure: Extract<Drawn, { kind: 'timeline' }>, layout: Layout, p: Palette): Drawing {
  const W = WIDTH[layout];
  const pictures = icons(figure);
  const ICON = 24;
  const DOT = 6;
  const WHEN = 15;
  const n = figure.events.length;
  const rule = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${p.ink}" stroke-width="2"/>`;
  const dot = (cx: number, cy: number) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${DOT}" fill="${p.accent}" stroke="${p.surface}" stroke-width="2"/>`;

  if (layout === 'wide') {
    // One rule across, read left to right: each date above its dot, what happens then below it.
    const cw = (W - 2 * PAD) / n;
    const whens = figure.events.map((event) => wrap(event.when, cw - 12, WHEN, 700));
    const labels = figure.events.map((event) => wrap(event.label, cw - 16));
    const iconBand = pictures.some(Boolean) ? ICON + 10 : 0;
    const whenH = Math.max(...whens.map((lines) => height(lines, WHEN)));
    const line = PAD + whenH + 12;
    const below = line + DOT + 14;
    const tallest = Math.max(...labels.map((lines) => height(lines)));
    const body =
      rule(PAD, line, W - PAD, line) +
      // The rule runs on past the last date, and ends in an arrow: time goes on.
      arrow(W - PAD - 14, line, W - PAD + 1, line, { ...p, accent: p.ink }) +
      figure.events
        .map((event, i) => {
          const cx = PAD + cw * (i + 0.5);
          return (
            text(cx, line - 12 - height(whens[i], WHEN), whens[i], p.accent, { size: WHEN, weight: 700 }) +
            dot(cx, line) +
            icon(pictures[i], cx, below + ICON / 2, ICON, p.ink) +
            text(cx, below + iconBand, labels[i], p.ink)
          );
        })
        .join('');
    return { body, height: below + iconBand + tallest + PAD };
  }

  // Stacked: the rule runs down the left, each date and what happens then beside its dot.
  const stem = PAD + DOT + 2;
  const textLeft = stem + DOT + 14 + (pictures.some(Boolean) ? ICON + 10 : 0);
  let y = PAD;
  const dots: number[] = [];
  const parts = figure.events
    .map((event, i) => {
      const whenLines = wrap(event.when, W - textLeft - PAD, WHEN, 700);
      const labels = wrap(event.label, W - textLeft - PAD);
      const h = height(whenLines, WHEN) + 2 + height(labels);
      const mid = y + (WHEN * LEAD) / 2;
      dots.push(mid);
      const out =
        icon(pictures[i], stem + DOT + 14 + ICON / 2, y + h / 2, ICON, p.ink) +
        text(textLeft, y, whenLines, p.accent, { size: WHEN, weight: 700, anchor: 'start' }) +
        text(textLeft, y + height(whenLines, WHEN) + 2, labels, p.ink, { anchor: 'start' });
      y += h + 18;
      return out;
    })
    .join('');
  const end = y - 18;
  const body = rule(stem, dots[0], stem, end) + arrow(stem, end - 14, stem, end + 1, { ...p, accent: p.ink }) + parts + dots.map((d) => dot(stem, d)).join('');
  return { body, height: end + PAD };
}

/** What the diagram says, in words, for a picture made of it (the social card), which has no page around it. */
export function describe(figure: Drawn): string {
  const words = (item: unknown): string[] => (typeof item === 'string' ? [item] : item && typeof item === 'object' ? Object.values(item).flatMap(words) : []);
  const labels = Object.entries(figure).filter(([key]) => !['kind', 'caption', 'icons'].includes(key));
  return `${figure.caption}: ${words(Object.fromEntries(labels)).join('; ')}`;
}

/**
 * What the diagram says, as lists, for a reader who cannot see it: the steps in order, each side of a comparison
 * under its heading, the parts under the whole, the numbers with what they count. The page prints these out of
 * sight beside the drawing, and the caption names the figure.
 */
export function outline(figure: Drawn): { heading?: string; ordered: boolean; items: string[] }[] {
  switch (figure.kind) {
    case 'steps':
      return [{ ordered: true, items: figure.steps }];
    case 'compare':
      return [figure.left, figure.right].map((side) => ({ heading: side.heading, ordered: false, items: side.points }));
    case 'parts':
      return [{ heading: figure.whole, ordered: false, items: figure.parts }];
    case 'numbers':
      return [{ ordered: false, items: figure.numbers.map((num) => `${value(num.value)}: ${num.label}`) }];
    case 'timeline':
      return [{ ordered: true, items: figure.events.map((event) => `${event.when}: ${event.label}`) }];
  }
}

/**
 * The figure as an SVG document in one of its two layouts. On the page the drawing is `hidden` from screen readers,
 * which read its outline instead; a picture made on its own carries its description.
 */
export function figureSvg(figure: Drawn, layout: Layout, palette: Palette = PAGE, { hidden = false } = {}): string {
  const drawn = { steps, parts, compare, numbers, timeline }[figure.kind](figure as never, layout, palette);
  const W = drawn.width ?? WIDTH[layout];
  const H = Math.ceil(drawn.height);
  const background = palette.background ? `<rect width="${W}" height="${H}" fill="${palette.background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${esc(FONT)}" ${hidden ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${esc(describe(figure))}"`}>${background}${drawn.body}</svg>`;
}
