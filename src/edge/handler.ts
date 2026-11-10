// The work of the Cloudflare Pages Function in functions/_middleware.ts.
//
// The site is a single-page app, so without this every address answers with the same empty
// index.html. This gives each page its own title, description and links between its
// translations, writes the page's text into the HTML, answers 404 for addresses that do not
// exist and serves the sitemaps.
//
// It must never be the reason a page fails: whatever goes wrong, the plain app is served.
import { SITE_LANGUAGES, toSiteLanguage } from '../i18n/siteLanguage';
import { createSiteContext } from '../site/context';
import { buildHead } from '../site/head';
import { DEFAULT_LANGUAGE, hreflangOf } from '../site/locales';
import { canonicalPath, parsePath } from '../site/routes';
import { createApi, openEdgeCache } from './api';
import type { Api, CachePolicy, Loaded } from './api';
import { translatorFor } from './i18n';
import { buildPage } from './pages';
import { renderDocument } from './render';
import { SITEMAP_INDEX_PATH, SITEMAP_PATHS, pagesSitemap, serversSitemap, sitemapIndex } from './sitemap';
import type { EdgeContext } from './types';

// A page waits this long for data that is not cached yet. After that it goes out without its
// numbers and the browser loads them, as it did before this function existed. The API is in
// Europe, so a first visit from Asia often runs out of time, and the next one finds the cache.
const PAGE_BUDGET_MS = 1000;
// Crawlers fetch sitemaps rarely and wait for them.
const SITEMAP_BUDGET_MS = 10_000;
const FILE_NAME = /\/[^/]+\.[a-z0-9]{2,5}$/i;

// Says from outside what the function had to work with, such as "key=set; data=2/2": whether
// the edge key is configured, and how many of the API reads a response wanted were answered.
// A page without its numbers, or a response without this header, can then be explained with curl.
export const EDGE_HEADER = 'X-Edge';

function xml(body: string, report?: string) {
  const headers = new Headers({ 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
  if (report) headers.set(EDGE_HEADER, report);
  return new Response(body, { headers });
}

interface Reads {
  api: Api;
  report(): string;
}

async function apiFor(context: EdgeContext, budgetMs: number): Promise<Reads> {
  const api = createApi({
    apiOrigin: context.env.API_ORIGIN,
    edgeKey: context.env.EDGE_API_KEY,
    cache: await openEdgeCache(),
    // Both are called through their owners: the runtime rejects them when they are detached.
    fetch: (input, init) => fetch(input, init),
    waitUntil: (promise) => context.waitUntil(promise),
    budgetMs,
  });
  let asked = 0;
  let answered = 0;

  return {
    api: {
      async get<T>(path: string, policy: CachePolicy): Promise<Loaded<T>> {
        asked += 1;
        const loaded = await api.get<T>(path, policy);
        if (loaded) answered += 1;
        return loaded;
      },
    },
    report: () => `key=${context.env.EDGE_API_KEY ? 'set' : 'unset'}; data=${answered}/${asked}`,
  };
}

/**
 * The language the app will show this visitor at an address without a language prefix: the one
 * saved in the cookie, or else the browser's. The page is written in it from the start, so it
 * does not flip from English when the app loads. Crawlers send neither and get English.
 */
function visitorLanguage(request: Request) {
  const saved = /(?:^|;\s*)user\.language=([^;]+)/.exec(request.headers.get('Cookie') ?? '')?.[1];
  const accepted = (request.headers.get('Accept-Language') ?? '').split(',').map((part) => part.split(';')[0].trim());
  for (const code of [saved, ...accepted]) {
    const language = code ? toSiteLanguage(code) : null;
    if (language && SITE_LANGUAGES.includes(language)) return language;
  }
  return DEFAULT_LANGUAGE;
}

async function page(context: EdgeContext, url: URL): Promise<Response> {
  const parsed = parsePath(url.pathname);
  // Something like /logo.png that is not a page: the static files answer for it.
  if (!parsed.route && FILE_NAME.test(url.pathname)) return context.next();

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    return Response.redirect(`${url.origin}${url.pathname.replace(/\/+$/, '')}${url.search}`, 308);
  }

  const shell = await context.env.ASSETS.fetch(new URL('/', url));
  if (!shell.ok || !(shell.headers.get('Content-Type') ?? '').includes('text/html')) return context.next();

  const language = parsed.language ?? visitorLanguage(context.request);
  const ctx = createSiteContext(language, translatorFor(language), parsed.language);
  const reads = await apiFor(context, PAGE_BUDGET_MS);
  const { status, model } = await buildPage(ctx, parsed.route, reads.api);
  const head = buildHead({
    title: model.title,
    description: model.description,
    path: parsed.route ? canonicalPath(parsed.route) : parsed.path,
    urlLanguage: parsed.language,
    languages: model.languages,
    noindex: model.noindex || status === 404,
  });
  // The address decides everything in the head except, without a prefix, the language of the text.
  if (!parsed.language) head.lang = hreflangOf(language);

  // The headers of the static file carry the site's security policy, so they are kept.
  const headers = new Headers(shell.headers);
  headers.delete('Content-Length');
  headers.delete('ETag');
  headers.set('Content-Type', 'text/html; charset=utf-8');
  if (!parsed.language) headers.append('Vary', 'Accept-Language, Cookie');
  headers.set(EDGE_HEADER, reads.report());
  return new Response(renderDocument(await shell.text(), ctx, head, model), { status, headers });
}

export async function handleRequest(context: EdgeContext): Promise<Response> {
  const { request } = context;
  if (request.method !== 'GET' && request.method !== 'HEAD') return context.next();

  try {
    const url = new URL(request.url);
    if (url.pathname === SITEMAP_INDEX_PATH) return xml(sitemapIndex());
    if (url.pathname === SITEMAP_PATHS.pages || url.pathname === SITEMAP_PATHS.servers) {
      const reads = await apiFor(context, SITEMAP_BUDGET_MS);
      const body = url.pathname === SITEMAP_PATHS.pages ? await pagesSitemap(reads.api) : await serversSitemap(reads.api);
      return xml(body, reads.report());
    }
    return await page(context, url);
  } catch (error) {
    console.error('edge page failed', error);
    return context.next();
  }
}
