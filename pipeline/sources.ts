import { PAPER } from '../src/config';
import type { Source } from '../src/paper';

export type { Source };

/** The feeds the paper reads, as listed in paper.config.ts. */
export const SOURCES: Source[] = [...PAPER.sources];
