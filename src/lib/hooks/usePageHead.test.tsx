import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { applyHead, usePageHead } from './usePageHead';
import { buildHead } from '../../site/head';
import type { PageModel } from '../../site/pageModel';

const model: PageModel = {
  title: 'Rankings · Site',
  description: 'The busiest servers.',
  heading: 'Rankings',
  intro: [],
  sections: [],
  breadcrumbs: [],
};

function Page({ value, loadingTitle }: { value: PageModel | null; loadingTitle?: string }) {
  usePageHead(value, loadingTitle);
  return null;
}

function renderAt(path: string, value: PageModel | null, loadingTitle?: string) {
  return render(<MemoryRouter initialEntries={[path]}><Page value={value} loadingTitle={loadingTitle} /></MemoryRouter>);
}

function alternates() {
  return Array.from(document.head.querySelectorAll('link[rel="alternate"]'))
    .map((link) => `${link.getAttribute('hreflang')} ${link.getAttribute('href')}`);
}

afterEach(() => {
  document.head.innerHTML = '';
  document.documentElement.lang = '';
});

describe('usePageHead', () => {
  it('writes the title, description and addresses of the page', () => {
    renderAt('/rankings?sort=x', model);

    expect(document.title).toBe('Rankings · Site');
    expect(document.documentElement.lang).toBe('en');
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('The busiest servers.');
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://scplist.kr/rankings');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/rankings');
    expect(alternates()).toEqual(expect.arrayContaining([
      'x-default https://scplist.kr/rankings',
      'ko https://scplist.kr/ko/rankings',
    ]));
  });

  it('follows the language prefix of the address', () => {
    renderAt('/ko/rankings', model);

    expect(document.documentElement.lang).toBe('ko');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/ko/rankings');
  });

  it('spells a country address in lower case', () => {
    renderAt('/countries/KR', model);

    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/countries/kr');
  });

  it('only changes the title while the page has no data yet', () => {
    document.head.innerHTML = '<link rel="canonical" href="https://scplist.kr/before">';

    renderAt('/rankings', null, 'Rankings');

    expect(document.title).toBe('Rankings · SCP: Secret Laboratory Server List');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/before');
  });

  it('keeps an address that is not a page out of the index', () => {
    renderAt('/nothing-here', model);

    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    expect(alternates()).toEqual([]);
  });
});

describe('applyHead', () => {
  it('updates the tags the edge function wrote instead of adding more', () => {
    document.head.innerHTML = [
      '<title>old</title>',
      '<meta name="description" content="old">',
      '<link rel="canonical" href="https://scplist.kr/old">',
      '<link rel="alternate" hreflang="ko" href="https://scplist.kr/ko/old">',
      '<meta name="robots" content="noindex">',
    ].join('');

    applyHead(buildHead({ title: 'New', description: 'New text', path: '/stats', urlLanguage: null }));

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(alternates()).not.toContain('ko https://scplist.kr/ko/old');
    expect(alternates()).toContain('ko https://scplist.kr/ko/stats');
  });
});
