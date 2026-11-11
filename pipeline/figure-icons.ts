import { ICON_NAMES, type IconName } from '../src/lib/icons';
import type { Figure } from '../src/lib/figure';
import type { ChatMessage, LlmClient } from './llm';

// Pictograms for a diagram drawn before diagrams had them. The diagram itself is kept as it was printed: the model
// is shown only its labels and picks a pictogram for each from the set the page can draw. A cheap call, as no
// article is read. `npm run figure-icons` (figure-icons-cli.ts) does it for the stories already published.

type Drawn = Exclude<Figure, { kind: 'none' }>;

/** The labels a diagram puts a pictogram beside, in order: each step, part or number, or the two sides compared. */
export function iconLabels(figure: Drawn): string[] {
  switch (figure.kind) {
    case 'steps':
      return figure.steps;
    case 'parts':
      return figure.parts;
    case 'numbers':
      return figure.numbers.map((num) => num.label);
    case 'compare':
      return [figure.left.heading, figure.right.heading];
  }
}

/** Whether a diagram should be given pictograms: it has none, and it draws them. */
export const wantsIcons = (figure: Figure | undefined): figure is Drawn => Boolean(figure && figure.kind !== 'none' && !figure.icons?.length);

export const iconSystem = () => `You choose small line pictograms for the labels of a diagram in a newspaper about software.
For each label, in order, choose the one name from this list that best stands for it: ${ICON_NAMES.join(', ')}.
Answer with a JSON object only: {"icons": ["name", ...]}, with exactly one name for each label, in the order given.
If no name fits a label well, answer {"icons": null}: a diagram is better with no pictograms than with a wrong one.`;

/** The model's answer made into pictograms for these labels, or nothing when it is not one name per label from the list. */
export function readIcons(reply: string, count: number): IconName[] | undefined {
  const json = reply.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return undefined;
  try {
    const icons = (JSON.parse(json) as { icons?: unknown }).icons;
    const known = Array.isArray(icons) && icons.length === count && icons.every((icon) => (ICON_NAMES as readonly string[]).includes(String(icon)));
    return known ? (icons as IconName[]) : undefined;
  } catch {
    return undefined;
  }
}

/** Pictograms for one diagram, or nothing when the model found none that fit. */
export async function pickIcons(llm: LlmClient, figure: Drawn): Promise<IconName[] | undefined> {
  const labels = iconLabels(figure);
  const messages: ChatMessage[] = [
    { role: 'system', content: iconSystem() },
    { role: 'user', content: `Diagram: ${figure.caption}\nLabels:\n${labels.map((label, i) => `${i + 1}. ${label}`).join('\n')}` },
  ];
  const reply = await llm.chat(messages);
  return readIcons(reply.text, labels.length);
}
