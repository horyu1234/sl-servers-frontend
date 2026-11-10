import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import shell from '../../index.html?raw';
import { server } from '../site/pages/testData';
import { handleRequest } from './handler';
import { memoryCache } from './testUtils';
import type { EdgeContext } from './types';

const CSP = "frame-src 'self'";

function shellResponse() {
  return new Response(shell, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': CSP, ETag: '"abc"' },
  });
}

function contextFor(url: string, init: RequestInit = {}) {
  const next = vi.fn(async () => new Response('static file'));
  const assets = vi.fn(async (_input: Request | URL | string) => shellResponse());
  const context: EdgeContext = {
    request: new Request(url, init),
    env: { ASSETS: { fetch: assets }, EDGE_API_KEY: 'secret' },
    next,
    waitUntil: () => {},
  };
  return { context, next, assets };
}

/** Answers of the API by path. Anything else is a 404, as on an API without the new endpoints. */
function stubApi(answers: Record<string, unknown>) {
  const request = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const { pathname } = new URL(String(input));
    return pathname in answers
      ? new Response(JSON.stringify(answers[pathname]))
      : new Response('', { status: 404 });
  });
  vi.stubGlobal('fetch', request);
  return request;
}

beforeEach(() => {
  const cache = memoryCache();
  vi.stubGlobal('caches', { open: async () => cache });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('edge function', () => {
  it('leaves anything but a page request to the static files', async () => {
    const post = contextFor('https://scplist.kr/', { method: 'POST' });
    const image = contextFor('https://scplist.kr/logo.png');

    expect(await (await handleRequest(post.context)).text()).toBe('static file');
    expect(await (await handleRequest(image.context)).text()).toBe('static file');
    expect(post.assets).not.toHaveBeenCalled();
  });

  it('serves a page with its own head and the headers of the static file', async () => {
    stubApi({ '/api/servers/7': server });
    const { context, assets } = contextFor('https://scplist.kr/servers/7');

    const response = await handleRequest(context);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('Content-Security-Policy')).toBe(CSP);
    expect(response.headers.has('ETag')).toBe(false);
    expect(html).toContain('<title>[KR] Site-19 &amp; Friends · SCP: Secret Laboratory Server List</title>');
    expect(html).toContain('<link rel="canonical" href="https://scplist.kr/servers/7">');
    expect(String(assets.mock.calls[0][0])).toBe('https://scplist.kr/');
  });

  it('reads the site endpoints on the public API host with the edge key', async () => {
    const request = stubApi({ '/api/servers/7': server });

    await handleRequest(contextFor('https://scplist.kr/servers/7').context);

    const [url, init] = request.mock.calls[0];
    expect(String(url)).toMatch(/^https:\/\/api\.scplist\.kr\/api\//);
    expect(new Headers(init?.headers).get('X-Scplist-Edge-Key')).toBe('secret');
  });

  it.each([
    ['both answers of a server page', '/servers/7', { '/api/servers/7': server, '/api/v2/servers/7/insights': { serverId: 7, generatedAt: '', history: null, heatmap: null } }, 'key=set; data=2/2'],
    ['one answer of two', '/servers/7', { '/api/servers/7': server }, 'key=set; data=1/2'],
    ['no answer', '/rankings', {}, 'key=set; data=0/1'],
    ['a page that reads nothing', '/about', {}, 'key=set; data=0/0'],
    ['the reads of a sitemap', '/sitemaps/pages.xml', {}, 'key=set; data=0/3'],
  ])('reports %s in a header', async (_name, path, answers, report) => {
    stubApi(answers);

    const response = await handleRequest(contextFor(`https://scplist.kr${path}`).context);

    expect(response.headers.get('X-Edge')).toBe(report);
  });

  it('says when the edge key is not configured, without ever showing it', async () => {
    stubApi({});
    const { context } = contextFor('https://scplist.kr/rankings');
    context.env.EDGE_API_KEY = undefined;

    const unset = await handleRequest(context);
    const set = await handleRequest(contextFor('https://scplist.kr/rankings').context);

    expect(unset.headers.get('X-Edge')).toBe('key=unset; data=0/1');
    expect(set.headers.get('X-Edge')).not.toContain('secret');
  });

  it('treats a version number as a page, not as a file name', async () => {
    stubApi({});
    const { context, next } = contextFor('https://scplist.kr/versions/14.2.9');

    const response = await handleRequest(context);

    expect(next).not.toHaveBeenCalled();
    expect(await response.text()).toContain('<title>SCP: SL 14.2.9');
  });

  it.each([
    'https://scplist.kr/nothing-here',
    'https://scplist.kr/servers/abc',
    'https://scplist.kr/xx/stats',
  ])('answers 404 with the app for %s', async (url) => {
    stubApi({});

    const response = await handleRequest(contextFor(url).context);
    const html = await response.text();

    expect(response.status).toBe(404);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toContain('/src/main.tsx');
  });

  it('answers 404 for a server the API does not know', async () => {
    stubApi({ '/api/servers/7': null });

    expect((await handleRequest(contextFor('https://scplist.kr/servers/7').context)).status).toBe(404);
  });

  it('serves the Korean page under /ko and the English one without a prefix', async () => {
    stubApi({});

    const korean = await (await handleRequest(contextFor('https://scplist.kr/ko/rankings').context)).text();
    const english = await (await handleRequest(contextFor('https://scplist.kr/rankings').context)).text();

    expect(korean).toContain('<html lang="ko">');
    expect(korean).toContain('<h1 class="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">서버 랭킹</h1>');
    expect(english).toContain('<html lang="en">');
    expect(english).toContain('>Server rankings</h1>');
  });

  it.each([
    ['the saved language', { Cookie: 'theme=dark; user.language=ko-KR', 'Accept-Language': 'en-US,en;q=0.9' }, 'ko', '서버 랭킹'],
    ['the browser language', { 'Accept-Language': 'ko,en-US;q=0.9' }, 'ko', '서버 랭킹'],
    ['the next browser language when the first has no translation', { 'Accept-Language': 'ja,ko;q=0.9' }, 'ko', '서버 랭킹'],
    ['English for a crawler, which sends neither', {}, 'en', 'Server rankings'],
    ['English when nothing matches', { 'Accept-Language': 'ja', Cookie: 'user.language=xx' }, 'en', 'Server rankings'],
  ])('writes an address without a prefix in %s', async (_name, headers, lang, heading) => {
    stubApi({});

    const response = await handleRequest(contextFor('https://scplist.kr/rankings', { headers }).context);
    const html = await response.text();

    expect(html).toContain(`<html lang="${lang}">`);
    expect(html).toContain(`>${heading}</h1>`);
    // The address is the same for everyone, and so are its links.
    expect(html).toContain('<link rel="canonical" href="https://scplist.kr/rankings">');
    expect(html).toContain('href="/countries"');
    expect(response.headers.get('Vary')).toContain('Accept-Language');
  });

  it('does not let the visitor change the language of a prefixed address', async () => {
    stubApi({});

    const response = await handleRequest(contextFor('https://scplist.kr/ko/rankings', { headers: { 'Accept-Language': 'en-US' } }).context);

    expect(await response.text()).toContain('<html lang="ko">');
    expect(response.headers.get('Vary') ?? '').not.toContain('Accept-Language');
  });

  it('points every filtered view of the list at the list itself', async () => {
    stubApi({});

    const html = await (await handleRequest(contextFor('https://scplist.kr/?country=KR&sort=PLAYERS_DESC').context)).text();

    expect(html).toContain('<link rel="canonical" href="https://scplist.kr/">');
  });

  it('sends an address with a trailing slash to the one without', async () => {
    const response = await handleRequest(contextFor('https://scplist.kr/stats/?x=1').context);

    expect(response.status).toBe(308);
    expect(response.headers.get('Location')).toBe('https://scplist.kr/stats?x=1');
  });

  it('serves the sitemaps', async () => {
    stubApi({ '/api/v2/servers': [{ serverId: 7 }] });

    const index = await handleRequest(contextFor('https://scplist.kr/sitemap.xml').context);
    const servers = await handleRequest(contextFor('https://scplist.kr/sitemaps/servers.xml').context);

    expect(index.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    expect(await index.text()).toContain('https://scplist.kr/sitemaps/pages.xml');
    expect(await servers.text()).toContain('<loc>https://scplist.kr/servers/7</loc>');
  });

  it('falls back to the plain app when anything fails', async () => {
    const { context, next } = contextFor('https://scplist.kr/stats');
    context.env.ASSETS.fetch = async () => { throw new Error('assets down'); };
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await (await handleRequest(context)).text()).toBe('static file');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('falls back to the plain app when the shell is not the page it expects', async () => {
    const { context, next } = contextFor('https://scplist.kr/stats');
    context.env.ASSETS.fetch = async () => new Response('nope', { status: 500 });

    await handleRequest(context);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
