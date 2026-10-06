// The three colours the paper is printed in. A paper may set its own in
// paper.config.ts (`colours`); these are used for any it leaves out. The page's
// styles take them from here (see astro.config.mjs), and so does the brief for
// a story's illustration, so a picture is drawn in the paper's own colours.

import paper from '../../paper.config';

const DEFAULTS = {
  /** The sheet the paper is printed on. */
  paper: '#f1ebdd',
  /** Text and rules. */
  ink: '#1c1a16',
  /** The one accent colour. */
  accent: '#8f4a08',
};

const own: { paper?: string; ink?: string; accent?: string } = paper.colours ?? {};

/** The word of the nameplate printed in colour, where a paper names one. The same blue as --nameplate-accent in the styles. */
export const NAMEPLATE_ACCENT = '#00a1e0';

export const INK = { paper: own.paper ?? DEFAULTS.paper, ink: own.ink ?? DEFAULTS.ink, accent: own.accent ?? DEFAULTS.accent };
