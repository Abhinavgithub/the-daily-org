// The paper's settings, as the site and the pipeline read them. They are set in
// paper.config.ts; this file only hands them out. Keep it free of Astro imports.

import paper from '../paper.config';
import type { Paper } from './paper';

export { SOURCE_TYPES, type SourceType } from './paper';

/** The paper this project publishes. */
export const PAPER: Paper = paper;

export const SITE = {
  name: PAPER.name,
  tagline: PAPER.tagline,
  creator: PAPER.creator,
  description: PAPER.description,
  disclaimer: PAPER.disclaimer,
  repository: PAPER.repository,
};

export const SECTIONS = PAPER.sections;
export const PERSONAS = PAPER.personas;

export function sectionLabel(id: string): string {
  return SECTIONS.find((s) => s.id === id)?.label ?? id;
}
