// The data files kept one JSON object to a line, read as the pages read them.

/** The objects of a JSON Lines text, in order. A blank line, or one that is not a JSON object, is skipped. */
export function jsonLines(text: string): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      continue;
    }
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) records.push(raw as Record<string, unknown>);
  }
  return records;
}
