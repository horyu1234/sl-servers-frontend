import { describe, expect, it } from 'vitest';
// The real page shell, so a change to index.html that breaks the markers fails here.
import shell from '../../index.html?raw';
import { buildHead } from '../site/head';
import { listModel } from '../site/pages/basic';
import { docModel } from '../site/pages/docs';
import { rankingsModel } from '../site/pages/rankings';
import { serverModel } from '../site/pages/server';
import { insights, rankings, server, testContext } from '../site/pages/testData';
import { EMPTY_ROOT, HEAD_END, HEAD_START, renderBody, renderDocument, renderHead } from './render';

const en = testContext();
const ko = testContext('ko-KR', 'ko-KR');

function documentOf(html: string) {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('index.html', () => {
  it('has the markers and the empty root the edge function fills', () => {
    expect(shell.indexOf(HEAD_START)).toBeGreaterThan(0);
    expect(shell.indexOf(HEAD_END)).toBeGreaterThan(shell.indexOf(HEAD_START));
    expect(shell.split(EMPTY_ROOT)).toHaveLength(2);
    expect(shell).toContain('<html lang="en">');
  });

  it('keeps a title and a description as the fallback between the markers', () => {
    const fallback = shell.slice(shell.indexOf(HEAD_START), shell.indexOf(HEAD_END));

    expect(fallback).toContain('<title>');
    expect(fallback).toContain('name="description"');
  });
});

describe('renderDocument', () => {
  const model = serverModel(en, server, insights);
  const head = buildHead({ title: model.title, description: model.description, path: '/servers/7', urlLanguage: null });
  const page = documentOf(renderDocument(shell, en, head, model));

  it('gives the page its own title, description and address', () => {
    expect(page.title).toBe('[KR] Site-19 & Friends · SCP: Secret Laboratory Server List');
    expect(page.querySelectorAll('title')).toHaveLength(1);
    expect(page.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(page.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(model.description);
    expect(page.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://scplist.kr/servers/7');
    expect(page.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/servers/7');
  });

  it('links the translations of the page', () => {
    const alternates = Array.from(page.querySelectorAll('link[rel="alternate"]'))
      .map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]);

    expect(alternates).toEqual(expect.arrayContaining([
      ['x-default', 'https://scplist.kr/servers/7'],
      ['en', 'https://scplist.kr/servers/7'],
      ['ko', 'https://scplist.kr/ko/servers/7'],
    ]));
  });

  it('writes the text of the page into the root', () => {
    const root = page.getElementById('root');

    expect(root?.querySelector('h1')?.textContent).toBe('[KR] Site-19 & Friends');
    expect(root?.textContent).toContain('It first appeared in the server list on October 24, 2023.');
    expect(root?.textContent).toContain('Similar servers in South Korea');
    expect(root?.querySelector('a[href="/servers/8"]')?.textContent).toBe('Neighbour server');
    expect(root?.querySelector('a[href="/countries/kr"]')).not.toBeNull();
  });

  it('keeps the rest of the shell: the app script and the consent banner', () => {
    expect(page.querySelector('script[type="module"]')?.getAttribute('src')).toBe('/src/main.tsx');
    expect(page.getElementById('silktide-consent-manager-css')).not.toBeNull();
    expect(page.querySelector('meta[property="og:image"]')).not.toBeNull();
  });

  it('describes the breadcrumbs for search engines', () => {
    const data = JSON.parse(page.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}');

    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement.map((item: { name: string; item: string }) => [item.name, item.item])).toEqual([
      ['Server list', 'https://scplist.kr/'],
      ['South Korea', 'https://scplist.kr/countries/kr'],
      ['[KR] Site-19 & Friends', 'https://scplist.kr/servers/7'],
    ]);
  });

  it('marks the language and keeps links inside it on a Korean address', () => {
    const koreanModel = serverModel(ko, server, insights);
    const koreanHead = buildHead({ title: koreanModel.title, description: koreanModel.description, path: '/servers/7', urlLanguage: 'ko-KR' });
    const korean = documentOf(renderDocument(shell, ko, koreanHead, koreanModel));

    expect(korean.documentElement.lang).toBe('ko');
    expect(korean.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/ko/servers/7');
    expect(korean.getElementById('root')?.querySelector('a[href="/ko/countries/kr"]')).not.toBeNull();
    expect(korean.getElementById('root')?.textContent).toContain('아군 공격이 켜져 있습니다.');
  });

  it('adds a robots tag and drops the translations for a page that must not be indexed', () => {
    const hidden = buildHead({ title: 'x', description: 'y', path: '/servers/7', urlLanguage: null, noindex: true });
    const html = documentOf(renderDocument(shell, en, hidden, model));

    expect(html.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
    expect(html.querySelectorAll('link[rel="alternate"]')).toHaveLength(0);
    expect(html.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it('describes the site itself on the home page', () => {
    const home = listModel(en);
    const homeHead = buildHead({ title: home.title, description: home.description, path: '/', urlLanguage: null });
    const html = documentOf(renderDocument(shell, en, homeHead, home));

    expect(JSON.parse(html.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}')).toMatchObject({
      '@type': 'WebSite',
      url: 'https://scplist.kr/',
    });
  });

  it('returns a shell without the markers untouched', () => {
    const old = '<html lang="en"><head><title>old</title></head><body><div id="root"></div></body></html>';

    expect(renderDocument(old, en, head, model)).toBe(old);
  });
});

describe('server names in the HTML', () => {
  const hostile = {
    ...server,
    info: '&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt; $&amp; $1 &quot;quoted&quot;',
  };
  const model = serverModel(en, hostile, null);
  const head = buildHead({ title: model.title, description: model.description, path: '/servers/7', urlLanguage: null });
  const html = renderDocument(shell, en, head, model);
  const page = documentOf(html);

  it('are text, never markup', () => {
    expect(page.querySelectorAll('script:not([src]):not([type])').length).toBe(documentOf(shell).querySelectorAll('script:not([src]):not([type])').length);
    expect(page.getElementById('root')?.querySelector('h1')?.textContent).toBe('</script><script>alert(1)</script> $& $1 "quoted"');
    expect(page.title).toContain('</script><script>alert(1)</script>');
  });

  it('cannot close the structured data script', () => {
    const scripts = page.querySelectorAll('script[type="application/ld+json"]');

    expect(scripts).toHaveLength(1);
    expect(() => JSON.parse(scripts[0].textContent ?? '')).not.toThrow();
    expect(html).not.toContain('</script><script>alert(1)');
  });
});

describe('renderBody', () => {
  it('draws tables with their links and numbers', () => {
    const body = documentOf(renderBody(en, rankingsModel(en, rankings)));

    expect(body.querySelectorAll('section')).toHaveLength(4);
    expect(body.querySelector('section h2')?.textContent).toBe('Most popular');
    expect(body.querySelector('section table a[href="/servers/99728"]')?.textContent).toBe('Dream <Mirror> #1');
    expect(body.querySelector('section table a[href="/countries/cn"]')?.textContent).toBe('China');
  });

  it('draws a written page with its links, code and tables', () => {
    const model = docModel(en, 'api');
    const body = documentOf(renderBody(en, model!));

    expect(body.querySelector('h1')?.textContent).toBe('API');
    expect(body.querySelector('pre code')?.textContent).toContain('curl "https://api.scplist.kr/api/v2/servers/players?serverIds=12345"');
    expect(body.querySelector('a[href="mailto:support@scplist.kr"]')).not.toBeNull();
    expect(body.querySelectorAll('main table').length).toBe(2);
  });

  it('links the main sections of the site from every page', () => {
    const body = documentOf(renderBody(ko, listModel(ko)));
    const hrefs = Array.from(body.querySelectorAll('footer a')).map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual(expect.arrayContaining(['/ko', '/ko/rankings', '/ko/countries', '/ko/privacy', '/ko/contact']));
  });
});
