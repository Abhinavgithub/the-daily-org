import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseHTML } from 'linkedom';
import { authorsFromLeadingByline, cleanAuthors, findAuthors } from './authors';

test('finding the writer', () => {
  const doc = (head: string) => parseHTML(`<html><head>${head}</head><body></body></html>`).document as unknown as Document;

  // A byline at the top of the text, with the next sentence's capital not mistaken for a surname.
  assert.deepEqual(
    authorsFromLeadingByline('By Ramya Subramani and Prateek Vats In our Engineering Energizers Q&A series, we'),
    ['Ramya Subramani', 'Prateek Vats'],
  );
  assert.deepEqual(authorsFromLeadingByline('By Ann Lee The platform has changed.'), ['Ann Lee']);
  assert.deepEqual(authorsFromLeadingByline('By Sohini Arya and Manish Kumar Jha. In our series'), ['Sohini Arya', 'Manish Kumar Jha']);
  assert.deepEqual(authorsFromLeadingByline('Bypassing limits is hard. By design it'), []);
  assert.deepEqual(authorsFromLeadingByline('By the end of this post you will'), []);

  // Structured data, including an author given by reference.
  const graph = {
    '@graph': [
      { '@type': 'Article', author: { '@id': '#/person/1' } },
      { '@type': 'Person', '@id': '#/person/1', name: 'Andrew Fawcett' },
    ],
  };
  assert.deepEqual(findAuthors(doc(`<script type="application/ld+json">${JSON.stringify(graph)}</script>`), ''), ['Andrew Fawcett']);
  const flat = { '@type': 'BlogPosting', author: [{ name: 'Ann Lee' }, 'Raj Rao'] };
  assert.deepEqual(findAuthors(doc(`<script type="application/ld+json">${JSON.stringify(flat)}</script>`), ''), ['Ann Lee', 'Raj Rao']);

  // Author tags, then the detected byline; a text byline outranks them all.
  assert.deepEqual(findAuthors(doc('<meta name="author" content="Tom M">'), ''), ['Tom M']);
  assert.deepEqual(findAuthors(doc(''), '', 'By Ann Lee | 5 min read'), ['Ann Lee']);
  assert.deepEqual(findAuthors(doc('<meta name="author" content="Scott Nyberg">'), 'By Ann Lee and Raj Rao We built'), ['Ann Lee', 'Raj Rao']);

  // Things that are not people.
  assert.deepEqual(cleanAuthors('Railway Engineering', /\brailway\b/i), [], "the paper's own words for what is not a person");
  assert.deepEqual(cleanAuthors('Railway Engineering', null), ['Railway Engineering']);
  assert.deepEqual(cleanAuthors('https://facebook.com/someone'), []);
  assert.deepEqual(cleanAuthors('Editorial Team'), []);
  assert.deepEqual(cleanAuthors('admin'), []);
  assert.deepEqual(findAuthors(doc('<meta property="article:author" content="https://facebook.com/x">'), ''), []);
});
