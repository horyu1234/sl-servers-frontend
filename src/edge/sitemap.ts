// The sitemaps. /sitemap.xml is an index of two files: the pages of the site, and the servers
// that are online. Every address is listed once per language, each with links to the others.
import { buildHead } from '../site/head';
import { DEFAULT_LANGUAGE, PREFIXED_LANGUAGES } from '../site/locales';
import { docLanguages } from '../site/pages/docs';
import { escapeHtml } from '../site/plainText';
import { ROUTE_PATTERNS, absoluteUrl, pathOf } from '../site/routes';
import type { PageName } from '../site/routes';
import type { CountriesResponse, ReportsResponse, VersionsResponse } from '../types/api';
import type { Api } from './api';
import { API_PATHS, POLICIES } from './pages';

export const SITEMAP_INDEX_PATH = '/sitemap.xml';
export const SITEMAP_PATHS = { pages: '/sitemaps/pages.xml', servers: '/sitemaps/servers.xml' };

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

interface SitemapEntry {
  path: string;
  /** Languages the page's own text exists in. Unset for pages built from the locale files. */
  languages?: string[];
}

function urlElements({ path, languages }: SitemapEntry) {
  const translated = PREFIXED_LANGUAGES.filter((language) => !languages || languages.includes(language));
  return [null, ...translated].map((urlLanguage) => {
    const head = buildHead({ title: '', description: '', path, urlLanguage, languages });
    const alternates = head.alternates
      .map(({ hreflang, href }) => `<xhtml:link rel="alternate" hreflang="${escapeHtml(hreflang)}" href="${escapeHtml(href)}"/>`)
      .join('');
    return `<url><loc>${escapeHtml(head.canonical)}</loc>${alternates}</url>`;
  }).join('\n');
}

function urlset(entries: SitemapEntry[]) {
  return `${XML_HEADER}\n`
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + `${entries.map(urlElements).join('\n')}\n`
    + '</urlset>\n';
}

export function sitemapIndex() {
  return `${XML_HEADER}\n`
    + '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + Object.values(SITEMAP_PATHS).map((path) => `<sitemap><loc>${absoluteUrl(path)}</loc></sitemap>`).join('\n')
    + '\n</sitemapindex>\n';
}

// Pages whose address has no parameter. The ones with parameters come from the API.
const FIXED_PAGES: PageName[] = ROUTE_PATTERNS
  .filter(({ pattern }) => !pattern.includes(':'))
  .map(({ page }) => page);

/** The fixed pages, and every country, game version and report the API knows. */
export async function pagesSitemap(api: Api) {
  const [countries, versions, reports] = await Promise.all([
    api.get<CountriesResponse>(API_PATHS.countries, POLICIES.HOURLY),
    api.get<VersionsResponse>(API_PATHS.versions, POLICIES.SLOW),
    api.get<ReportsResponse>(API_PATHS.reports, POLICIES.SLOW),
  ]);

  return urlset([
    ...FIXED_PAGES.map((page) => ({ path: pathOf(page), languages: docLanguages(page) })),
    ...(countries?.data.countries ?? []).map(({ isoCode }) => ({ path: pathOf('country', { isoCode: isoCode.toLowerCase() }) })),
    ...(versions?.data.versions ?? []).map(({ version }) => ({ path: pathOf('version', { version }) })),
    ...[...(reports?.data.years ?? []), ...(reports?.data.months ?? [])].map(({ period }) => ({ path: pathOf('report', { period }) })),
  ]);
}

/** Servers that are online. Offline servers keep their pages but are not offered for indexing. */
export async function serversSitemap(api: Api) {
  const servers = await api.get<{ serverId: number }[]>(API_PATHS.onlineServers, POLICIES.SLOW);
  return urlset((servers?.data ?? []).map(({ serverId }) => ({ path: pathOf('server', { serverId }) })));
}

export { DEFAULT_LANGUAGE };
