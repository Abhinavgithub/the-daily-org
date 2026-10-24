// A story's diagram drawn as SVG by code, from the same checked figure the
// page already stores. Every node and label in the figure is drawn exactly
// once, the lettering is real text, and the colours are the page's own
// variables, so the picture follows the reader's light or dark theme.
//
// PROTOTYPE: draws "parts" (a hub and its spokes) and "steps" (a row of
// stages). "compare" and "numbers" keep the existing HTML drawing for now.

import type { Figure } from './figure';

/** Pictograms a node may carry, chosen by name. Each is drawn on a 24-unit grid with strokes only. */
export const ICONS = {
  code: 'M4 5h16v14H4z M4 8h16 M10 12l-2 2 2 2 M14 12l2 2-2 2',
  database: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
  gears: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1',
  shield: 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z M9 12l2 2 4-4',
  cloud: 'M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4.5 4.5 0 0 1 17.5 18z',
  person: 'M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7',
  flow: 'M4 4h6v6H4z M14 14h6v6h-6z M7 10v4c0 1.1.9 2 2 2h5',
  chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  doc: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
} as const;
export type IconName = keyof typeof ICONS;

/** Colours from the page, with the printed paper's own as the fallback when the SVG is seen on its own. */
const C = { paper: 'var(--paper, #f1ebdd)', ink: 'var(--ink, #1c1a16)', accent: 'var(--accent, #8f4a08)', onAccent: 'var(--paper, #f1ebdd)' };
const FONT = `'Libre Franklin', 'Helvetica Neue', Arial, sans-serif`;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Break a label into lines of at most `max` characters, at spaces. A word longer than a line keeps its own line. */
export function wrap(label: string, max: number): string[] {
  const lines: string[] = [];
  for (const word of label.split(/\s+/)) {
    const last = lines.at(-1);
    if (last !== undefined && last.length + 1 + word.length <= max) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

function text(x: number, y: number, lines: string[], size: number, fill: string, weight = 500, anchor = 'middle'): string {
  const lead = size * 1.2;
  const top = y - ((lines.length - 1) * lead) / 2;
  return `<text x="${x}" y="${top}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="middle" font-family="${FONT}">${lines
    .map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lead}">${esc(line)}</tspan>`)
    .join('')}</text>`;
}

const icon = (name: IconName | undefined, cx: number, cy: number, size: number, colour: string) =>
  name ? `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})" fill="none" stroke="${colour}" stroke-width="${(1.6 * 24) / size + 0.6}" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/></g>` : '';

const frame = (w: number, h: number, body: string, title: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><rect width="${w}" height="${h}" fill="${C.paper}"/>${body}</svg>`;

/** A whole in the middle and its parts around it, one spoke per part and no more. */
function parts(figure: Extract<Figure, { kind: 'parts' }>, icons: (IconName | undefined)[]): string {
  const W = 960;
  const H = 540;
  const cx = W / 2;
  const cy = H / 2;
  const n = figure.parts.length;
  const rx = 330;
  const ry = 185;
  // Spread evenly round an ellipse, starting at the top-left so three parts sit left, right and below, not in a column.
  const start = -Math.PI / 2 - Math.PI / n;
  const nodes = figure.parts.map((label, i) => {
    const a = start + (i * 2 * Math.PI) / n;
    return { label, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), icon: icons[i] };
  });
  const hub = { w: 230, h: 96 };
  const card = { w: 210, h: 120 };
  const spokes = nodes.map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${C.accent}" stroke-width="4" stroke-linecap="round"/>`).join('');
  const cards = nodes
    .map((p) => {
      const lines = wrap(p.label, 20);
      const iconY = p.icon ? p.y - 22 : p.y;
      const textY = p.icon ? p.y + 26 : p.y;
      return `<rect x="${p.x - card.w / 2}" y="${p.y - card.h / 2}" width="${card.w}" height="${card.h}" rx="10" fill="${C.paper}" stroke="${C.ink}" stroke-width="2"/>${icon(p.icon, p.x, iconY, 40, C.ink)}${text(p.x, textY, lines, 17, C.ink)}`;
    })
    .join('');
  const middle = `<rect x="${cx - hub.w / 2}" y="${cy - hub.h / 2}" width="${hub.w}" height="${hub.h}" rx="12" fill="${C.accent}"/>${text(cx, cy, wrap(figure.whole, 14), 26, C.onAccent, 600)}`;
  // The frame is cut to what is drawn, so three parts do not leave an empty band where a fourth would go.
  const pad = 24;
  const ys = nodes.map((p) => p.y).concat(cy);
  const top = Math.min(...ys) - card.h / 2 - pad;
  const bottom = Math.max(...ys) + card.h / 2 + pad;
  return frame(W, bottom - top, `<g transform="translate(0 ${-top})">${spokes + cards + middle}</g>`, figure.caption);
}

/** Stages in a row, left to right, joined by arrows. */
function steps(figure: Extract<Figure, { kind: 'steps' }>, icons: (IconName | undefined)[]): string {
  const n = figure.steps.length;
  const card = { w: 170, h: 150, gap: 50 };
  const W = n * card.w + (n - 1) * card.gap + 80;
  const H = 260;
  const y = H / 2;
  const body = figure.steps
    .map((label, i) => {
      const x = 40 + card.w / 2 + i * (card.w + card.gap);
      const first = i === 0;
      const arrow = i < n - 1 ? `<path d="M${x + card.w / 2 + 8} ${y}h${card.gap - 16} m-8 -7 l8 7 -8 7" fill="none" stroke="${C.accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>` : '';
      return `<rect x="${x - card.w / 2}" y="${y - card.h / 2}" width="${card.w}" height="${card.h}" rx="10" fill="${first ? C.accent : C.paper}" stroke="${first ? C.accent : C.ink}" stroke-width="2"/>
<circle cx="${x - card.w / 2 + 20}" cy="${y - card.h / 2 + 20}" r="12" fill="${first ? C.onAccent : C.ink}"/>${text(x - card.w / 2 + 20, y - card.h / 2 + 21, [String(i + 1)], 14, first ? C.accent : C.paper, 700)}
${icon(icons[i], x, y - 18, 32, first ? C.onAccent : C.ink)}${text(x, y + (icons[i] ? 32 : 0), wrap(label, 17), 16, first ? C.onAccent : C.ink)}${arrow}`;
    })
    .join('');
  return frame(W, H, body, figure.caption);
}

/** The figure as an SVG document, or nothing for the kinds this prototype does not draw yet. `icons` names a pictogram per node, in order. */
export function figureSvg(figure: Figure, icons: (IconName | undefined)[] = []): string | undefined {
  if (figure.kind === 'parts') return parts(figure, icons);
  if (figure.kind === 'steps') return steps(figure, icons);
  return undefined;
}
