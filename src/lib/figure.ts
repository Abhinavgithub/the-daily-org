// The diagram a must-read story may carry. It is stored as data in the story's
// file and drawn by the page, so it takes the paper's colours and fonts.
//
// The shape is built from whichever copy of zod the caller uses: the site's
// content collection and the pipeline each have their own.

import type { z as Zod } from 'zod';

/** The longest a label of each sort may be, in characters. Short labels are what make a diagram readable at a glance. */
export const LIMITS = { caption: 120, step: 48, heading: 32, point: 64, value: 14, label: 64, whole: 40, part: 40 };

export function figureSchema(z: typeof Zod) {
  const text = (max: number) => z.string().trim().min(2).max(max);
  const caption = text(LIMITS.caption);
  const side = z.object({ heading: text(LIMITS.heading), points: z.array(text(LIMITS.point)).min(2).max(4) });
  return z.discriminatedUnion('kind', [
    // The model looked and found nothing worth drawing. Kept so the story is not asked about again.
    z.object({ kind: z.literal('none') }),
    z.object({ kind: z.literal('steps'), caption, steps: z.array(text(LIMITS.step)).min(2).max(5) }),
    z.object({ kind: z.literal('compare'), caption, left: side, right: side }),
    z.object({
      kind: z.literal('numbers'),
      caption,
      numbers: z.array(z.object({ value: z.string().trim().min(1).max(LIMITS.value), label: text(LIMITS.label) })).min(1).max(3),
    }),
    z.object({ kind: z.literal('parts'), caption, whole: text(LIMITS.whole), parts: z.array(text(LIMITS.part)).min(3).max(6) }),
  ]);
}

export type Figure = Zod.infer<ReturnType<typeof figureSchema>>;
