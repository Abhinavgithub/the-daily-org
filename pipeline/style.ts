// The paper's house style. Applied by code after the model has written and
// proof-read a story, so capitalisation is consistent whatever the model does.
// The terms themselves are the paper's `glossary`, in paper.config.ts.

import { PAPER } from '../src/config';
import type { Paper } from '../src/paper';

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A function that rewrites every one of `terms` to the capitalisation given. A trailing "s" in the text is kept. */
export function glossary(terms: readonly string[]): (text: string) => string {
  // Longer terms first, so "Custom Metadata Type" wins over "Custom Metadata".
  const rules = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((term) => ({
      term,
      // A space in a term also matches a hyphen or several spaces: "record triggered flow".
      pattern: new RegExp(`(?<![\\w-])${escape(term).replace(/[ -]/g, '[ -]')}(s?)(?![\\w-])`, 'gi'),
    }));
  return (text) => {
    let out = text;
    for (const { term, pattern } of rules) {
      out = out.replace(pattern, (_match, plural: string) => term + (plural ? 's' : ''));
    }
    return out;
  };
}

const glossaries = new WeakMap<Paper, (text: string) => string>();

/** Rewrite every term in the paper's glossary to its canonical capitalisation. */
export function applyGlossary(text: string, paper: Paper = PAPER): string {
  let apply = glossaries.get(paper);
  if (!apply) glossaries.set(paper, (apply = glossary(paper.glossary ?? [])));
  return apply(text);
}

/**
 * Turn a Title Case Headline into sentence case, keeping proper nouns. A word
 * keeps its capital if it has one inside it or a digit ("AIforce", "DevOps"),
 * is all capitals ("SOQL"), or is written with a capital in the middle of a
 * sentence somewhere in `context`. Headlines already in sentence case are
 * returned untouched. Run the glossary afterwards to restore feature names.
 */
export function sentenceCase(headline: string, context = ''): string {
  const tokens = headline.split(' ');
  const capitalised = tokens.slice(1).filter((t) => /^\p{Lu}/u.test(t)).length;
  if (tokens.length < 4 || capitalised / (tokens.length - 1) < 0.6) return headline;

  // Capitalised words in the context that do not start a sentence.
  const properNouns = new Set<string>();
  for (const match of context.matchAll(/(?<![.!?:]\s|^|\n)(?<=\s)(\p{Lu}[\p{L}\p{N}'’-]*)/gu)) {
    properNouns.add(match[1]);
  }
  const bare = (word: string) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

  return tokens
    .map((token, i) => {
      const word = bare(token);
      const afterColon = i > 0 && /[:?!]$/.test(tokens[i - 1]);
      if (i === 0 || afterColon || !/^\p{Lu}/u.test(word)) return token;
      // Judged part by part, so "Per-Instance" is lowered but "AIforce-Ready" is not.
      const parts = word.split('-');
      const keeps =
        /\d/.test(word) ||
        properNouns.has(word) ||
        parts.some((part) => /\p{Lu}/u.test(part.slice(1)) || properNouns.has(part));
      return keeps ? token : token.replace(word, word.toLowerCase());
    })
    .join(' ');
}

/** The same rules, stated for the model. */
export function houseStyle(paper: Paper = PAPER): string {
  const terms = paper.glossary ?? [];
  const own = paper.houseStyle ?? (terms.length ? [`Write these names exactly as shown every time they appear: ${terms.slice(0, 30).join(', ')}.`] : []);
  return ['House style:', 'US spelling. Complete, grammatical sentences. No exclamation marks.', ...own, 'Use product names exactly as the article gives them. Do not swap one name for another.', 'Be consistent: the same term is written the same way throughout.']
    .map((line, i) => (i === 0 ? line : `- ${line}`))
    .join('\n');
}
