// Working out who wrote an article, from its page, its text or its feed.

import { PAPER } from '../src/config';

const MAX_AUTHORS = 3;

const NOT_A_PERSON = /\b(team|staff|editor(ial|s)?|admin(istrator)?|guest|contributor|author|news|blog|media|inc|ltd|llc)\b/i;
/** Capitalised words that begin a sentence rather than end a name. */
const SENTENCE_STARTERS = new Set(
  'In The A An On At This That These Our We As For With When How Why What If It To From Today Here There Explore Learn Read Meet'.split(' '),
);

// A byline that names the organisation the paper covers is not a person either.
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const notPeople = (words: readonly string[]) => (words.length ? new RegExp(`\\b(${words.map(escape).join('|')})\\b`, 'i') : null);
const PAPERS_OWN = notPeople(PAPER.notAuthors ?? []);

/** Turn a byline such as "By Ann Lee and Raj Rao | 5 min read" into individual names, dropping anything that is not one. */
export function cleanAuthors(raw: string, alsoNot: RegExp | null = PAPERS_OWN): string[] {
  const names = raw
    .replace(/\s+/g, ' ')
    .replace(/^\s*(written |posted |published )?by[:\s]+/i, '')
    .split(/\s*(?:,|&|\band\b|\|)\s*/i)
    .map((name) => name.trim().replace(/[.,;:]+$/, ''))
    .filter(
      (name) =>
        name.length >= 3 &&
        name.length <= 40 &&
        /^\p{Lu}/u.test(name) &&
        name.split(' ').length <= 4 &&
        !/[\d@/:]/.test(name) &&
        !NOT_A_PERSON.test(name) &&
        !alsoNot?.test(name),
    );
  return [...new Set(names)].slice(0, MAX_AUTHORS);
}

/** "By Ann Lee and Raj Rao In our series…" at the very start of an article. */
export function authorsFromLeadingByline(text: string): string[] {
  // A word of a name is a capitalised word or an initial ("F."). A full stop after a
  // whole word ends the byline, so "Mei Chen. Timetable Test Mode…" stops at "Chen".
  const word = String.raw`(?:\p{Lu}\.|\p{Lu}[\p{L}'’-]+)`;
  const name = String.raw`${word}(?: ${word}){0,3}`;
  const match = text.trimStart().match(new RegExp(String.raw`^By (${name}(?:(?:,| and|,? &) ${name}){0,2})`, 'u'));
  if (!match) return [];
  // The pattern cannot tell a surname from the capital that starts the next sentence, so trim those.
  const names = match[1].split(/\s*(?:,|&|\band\b)\s*/).map((part) => {
    const words = part.trim().split(' ');
    while (words.length > 1 && SENTENCE_STARTERS.has(words.at(-1)!)) words.pop();
    return words.join(' ');
  });
  return cleanAuthors(names.join(', '));
}

function jsonLdAuthors(document: Document): string[] {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    let data: unknown;
    try {
      data = JSON.parse(script.textContent ?? '');
    } catch {
      continue;
    }
    const nodes: Record<string, any>[] = [];
    const collect = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') {
        nodes.push(value as Record<string, any>);
        collect((value as Record<string, any>)['@graph']);
      }
    };
    collect(data);

    // Authors are often given as a reference to a Person elsewhere in the graph.
    const byId = new Map(nodes.filter((n) => n['@id']).map((n) => [n['@id'], n]));
    const article = nodes.find((n) => n.author && /Article|BlogPosting|Report/i.test(String(n['@type'])));
    if (!article) continue;
    const names = [article.author]
      .flat()
      .map((a) => (typeof a === 'string' ? a : (a?.name ?? byId.get(a?.['@id'])?.name)))
      .filter((n): n is string => typeof n === 'string');
    const authors = cleanAuthors(names.join(', '));
    if (authors.length) return authors;
  }
  return [];
}

/**
 * Who wrote the article, from the strongest signal to the weakest: a byline at
 * the top of the text, structured data, author tags, then the detected byline.
 * A byline in the text comes first because the page's own metadata often names
 * whoever published the post rather than who wrote it.
 */
export function findAuthors(document: Document, text: string, detectedByline?: string | null): string[] {
  const fromText = authorsFromLeadingByline(text);
  if (fromText.length) return fromText;

  const fromJsonLd = jsonLdAuthors(document);
  if (fromJsonLd.length) return fromJsonLd;

  for (const selector of ['meta[name="author"]', 'meta[property="article:author"]', 'meta[name="parsely-author"]']) {
    const authors = cleanAuthors(document.querySelector(selector)?.getAttribute('content') ?? '');
    if (authors.length) return authors;
  }
  return cleanAuthors(detectedByline ?? '');
}
