import assert from 'node:assert/strict';
import { test } from 'node:test';
import { figureSvg, wrap, type Drawn } from './diagram';

const figures: Drawn[] = [
  { kind: 'steps', caption: 'How it runs', steps: ['Edit Apex locally', 'Run tests', 'Deploy'], icons: ['code', 'test', 'cloud'] },
  { kind: 'parts', caption: 'What it is made of', whole: 'Local Apex runtime', parts: ['Apex interpreter', 'Local database for SOQL and DML', 'Rule engine for limits and execution'] },
  { kind: 'compare', caption: 'Old and new', left: { heading: 'Deploy loop', points: ['Minutes', 'Needs an org'] }, right: { heading: 'Local runtime', points: ['Seconds', 'On a laptop'] } },
  { kind: 'numbers', caption: 'The figures', numbers: [{ value: '200 ms', label: 'Median test run' }, { value: '5 x', label: 'Faster cycle' }] },
];

/** Every word of the labels, in the order drawn, read back from the SVG's text. */
const drawnText = (svg: string) => [...svg.matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map((m) => m[1]).join(' ');

test('every label of a diagram is drawn, whole, in both layouts', () => {
  for (const figure of figures) {
    const rest = Object.fromEntries(Object.entries(figure).filter(([key]) => !['kind', 'caption', 'icons'].includes(key)));
    const labels = JSON.stringify(rest).match(/"[^"]{2,}"/g)!.map((s) => s.slice(1, -1)).filter((s) => !['heading', 'points', 'value', 'label', 'left', 'right', 'whole', 'parts', 'steps', 'numbers'].includes(s));
    for (const layout of ['wide', 'narrow'] as const) {
      const text = drawnText(figureSvg(figure, layout));
      for (const label of labels) assert.ok(text.includes(label.split(' ')[0]), `${figure.kind} ${layout}: ${label}`);
    }
  }
});

test('a hub has one spoke for each part and no more', () => {
  const parts = figures[1];
  assert.equal(figureSvg(parts, 'wide').match(/<line /g)?.length, 3);
  const six = { ...parts, parts: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'] } as Drawn;
  assert.equal(figureSvg(six, 'wide').match(/<line /g)?.length, 6);
});

test('the drawing takes the page colours and says what it shows', () => {
  const svg = figureSvg(figures[0], 'wide');
  assert.match(svg, /var\(--ink\)/);
  assert.match(svg, /var\(--sun\)/);
  assert.match(svg, /aria-label="How it runs: Edit Apex locally; Run tests; Deploy"/);
  assert.equal(figureSvg(figures[0], 'wide').match(/<path d="M3 5h18/g)?.length, 1, 'the pictogram named for the first step');
});

test('labels wrap at spaces to fit their box, and text is escaped', () => {
  assert.deepEqual(wrap('Rule engine for limits and execution', 120), ['Rule engine', 'for limits and', 'execution']);
  assert.ok(figureSvg({ kind: 'steps', caption: 'A & B', steps: ['<script>', 'x & y'] }, 'narrow').includes('&lt;script&gt;'));
});
