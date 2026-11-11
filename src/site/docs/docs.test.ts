import { describe, expect, it } from 'vitest';
import { ABOUT } from './about';
import { API_GUIDE } from './apiGuide';
import { CONTACT } from './contact';
import { FUNDING } from './funding';
import { METHODOLOGY } from './methodology';
import { PRIVACY } from './privacy';
import { parseInline, plainInline } from './types';
import type { Doc, DocBlock } from './types';
import { parsePath } from '../routes';

const DOCS = { ABOUT, API_GUIDE, CONTACT, FUNDING, METHODOLOGY, PRIVACY };

function inlineTexts(block: DocBlock): string[] {
  switch (block.type) {
    case 'ul': return block.items;
    case 'table': return [...block.head, ...block.rows.flat()];
    case 'code': return [];
    default: return [block.text];
  }
}

function linksOf(doc: Doc) {
  return [...doc.intro, ...doc.blocks.flatMap(inlineTexts)]
    .flatMap((text) => parseInline(text))
    .flatMap((token) => (token.type === 'link' ? [token.href] : []));
}

describe('parseInline', () => {
  it('splits a text into its links, code and bold parts', () => {
    expect(parseInline('See [the API](/api), `GET` and **daily peak**.')).toEqual([
      { type: 'text', text: 'See ' },
      { type: 'link', text: 'the API', href: '/api' },
      { type: 'text', text: ', ' },
      { type: 'code', text: 'GET' },
      { type: 'text', text: ' and ' },
      { type: 'bold', text: 'daily peak' },
      { type: 'text', text: '.' },
    ]);
  });

  it('leaves a text without marks whole', () => {
    expect(parseInline('Just text.')).toEqual([{ type: 'text', text: 'Just text.' }]);
    expect(plainInline('See [the API](/api) and `GET`.')).toBe('See the API and GET.');
  });
});

describe.each(Object.entries(DOCS))('%s', (_name, docs) => {
  it.each(Object.entries(docs))('%s links only to pages that exist, to web addresses or to an email', (_language, doc) => {
    for (const href of linksOf(doc)) {
      if (href.startsWith('/')) expect(parsePath(href).route, href).not.toBeNull();
      else expect(href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });

  it.each(Object.entries(docs))('%s has a description that fits a search result', (_language, doc) => {
    expect(doc.description.length).toBeGreaterThan(40);
    expect(doc.description.length).toBeLessThanOrEqual(200);
  });

  it('links to the same places in every language', () => {
    const english = linksOf(docs['en-US']).sort();

    for (const doc of Object.values(docs)) expect(linksOf(doc).sort()).toEqual(english);
  });
});
