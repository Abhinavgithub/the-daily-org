// Numbers a command takes from its own options or from .env, read the same way by every command.

/** A number from the command line or .env, or the default when neither gives one. Anything that is not a number stops the run. */
export function setting(name: string, raw: string | undefined, fallback: number, min: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min) {
    console.error(`${name} must be a number of at least ${min}, got "${raw}".`);
    process.exit(1);
  }
  return value;
}

/** The least interest score a story is published with: `--threshold` when given, else SCORE_THRESHOLD, else 6. */
export const scoreThreshold = (option?: string) =>
  setting(option === undefined ? 'SCORE_THRESHOLD' : '--threshold', option ?? process.env.SCORE_THRESHOLD, 6, 1);
