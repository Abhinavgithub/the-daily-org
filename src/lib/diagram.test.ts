import assert from 'node:assert/strict';
import { test } from 'node:test';
import { figureSvg, isLong, measure, outline, value, wideFrom, wrap, type Drawn } from './diagram';

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

test('the drawing takes the page colours and, made on its own, says what it shows', () => {
  const svg = figureSvg(figures[0], 'wide');
  assert.match(svg, /var\(--ink\)/);
  assert.match(svg, /var\(--sun\)/);
  assert.match(svg, /aria-label="How it runs: Edit Apex locally; Run tests; Deploy"/);
  assert.equal(figureSvg(figures[0], 'wide').match(/<path d="M3 5h18/g)?.length, 1, 'the pictogram named for the first step');
});

test('labels wrap at spaces to fit their box, measured by the letters themselves, and text is escaped', () => {
  const label = 'Rule engine for limits and execution';
  const lines = wrap(label, 120);
  assert.equal(lines.join(' '), label, 'every word kept, in order');
  for (const line of lines) assert.ok(measure(line) <= 120, `"${line}" fits`);
  // Narrow letters fit more to a line than wide ones.
  assert.ok(wrap('illi illi illi illi', 100).length < wrap('WMWM WMWM WMWM WMWM', 100).length);
  const long = wrap('Use ExperienceCloudSiteBuilder', 80);
  for (const line of long) assert.ok(measure(line) <= 80, `"${line}" fits`);
  assert.ok(long.some((line) => line.endsWith('-')), 'a word too long for a line is broken with a hyphen');
  assert.ok(figureSvg({ kind: 'steps', caption: 'A & B', steps: ['<script>', 'x & y'] }, 'narrow').includes('&lt;script&gt;'));
});

test('wrapped lines are balanced, so no word is left on a line of its own', () => {
  // Filled greedily this would end on "year"; balanced, both lines carry words.
  const lines = wrap('Global demand for Salesforce talent, year on year', 250, 14);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((line) => line.split(' ').length >= 3), lines.join(' | '));
  assert.ok(Math.abs(measure(lines[0], 14) - measure(lines[1], 14)) < 80, 'about as long as each other');
});

test('a value is printed with a true minus sign', () => {
  assert.equal(value('-13%'), '\u221213%');
  assert.equal(value('-$3.9B'), '\u2212$3.9B');
  assert.equal(value('+14%'), '+14%');
  assert.equal(value('9-to-5'), '9-to-5');
  assert.ok(figureSvg({ kind: 'numbers', caption: 'Moves', numbers: [{ value: '-13%', label: 'Demand' }] }, 'wide').includes('\u221213%'));
});

test('on the page the drawing is hidden from screen readers, which read its outline as lists', () => {
  const svg = figureSvg(figures[0], 'wide', undefined, { hidden: true });
  assert.match(svg, /aria-hidden="true"/);
  assert.doesNotMatch(svg, /role="img"|aria-label/);
  assert.deepEqual(outline(figures[0]), [{ ordered: true, items: ['Edit Apex locally', 'Run tests', 'Deploy'] }]);
  assert.deepEqual(outline(figures[2]).map((list) => list.heading), ['Deploy loop', 'Local runtime']);
  assert.deepEqual(outline(figures[1])[0].heading, 'Local Apex runtime');
  assert.deepEqual(outline({ kind: 'numbers', caption: 'x', numbers: [{ value: '-2%', label: 'Churn' }] })[0].items, ['\u22122%: Churn']);
});

test('a row of four or five steps waits for a wider story than other drawings', () => {
  const steps = (n: number) => ({ kind: 'steps', caption: 'Steps', steps: Array.from({ length: n }, (_, i) => `Step ${i + 1}`) }) as Drawn;
  assert.deepEqual([2, 3, 4, 5, 6, 7].map((n) => wideFrom(steps(n))), [36, 36, 42, 52, 60, 60]);
  assert.equal(wideFrom(figures[2]), 36);
});

test('six or seven steps are one long row, without pictures, and need a wide story', () => {
  const seven = { kind: 'steps', caption: 'Seven stages', steps: ['Ground', 'Specify', 'Build', 'Verify', 'Review', 'Release', 'Observe'], icons: ['search', 'doc', 'code', 'test', 'check', 'rocket', 'chart'] } as Extract<Drawn, { kind: 'steps' }>;
  const svg = figureSvg(seven, 'wide');
  for (const step of seven.steps) assert.ok(drawnText(svg).includes(step), step);
  const tops = [...svg.matchAll(/<rect x="[^"]+" y="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(tops.length, 7);
  assert.equal(new Set(tops).size, 1, 'all on one row');
  assert.match(svg, /viewBox="0 0 1160 /);
  assert.equal(svg.match(/<path d="M3 5h18/g), null, 'no pictures');
  assert.ok(isLong(seven));
  assert.ok(!isLong({ ...seven, steps: seven.steps.slice(0, 5) }));
});
