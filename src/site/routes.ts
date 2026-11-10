// The site's addresses. The router, the links and the edge function all read this table, so a
// page exists in one place only.
import { languageOfUrlCode, urlCodeOf } from './locales';

export const SITE_ORIGIN = 'https://scplist.kr';

export type PageName =
  | 'list' | 'server' | 'stats' | 'map' | 'credit' | 'api'
  | 'countries' | 'country' | 'versions' | 'version'
  | 'rankings' | 'records' | 'reports' | 'report'
  | 'about' | 'methodology' | 'privacy' | 'contact';

interface RoutePattern {
  page: PageName;
  /** Segments without the leading slash. A segment starting with ":" is a parameter. */
  pattern: string;
  /** What each parameter must look like. An address that fails is a 404. */
  params?: Record<string, RegExp>;
}

export const ROUTE_PATTERNS: RoutePattern[] = [
  { page: 'list', pattern: '' },
  { page: 'server', pattern: 'servers/:serverId', params: { serverId: /^\d{1,12}$/ } },
  { page: 'stats', pattern: 'stats' },
  { page: 'map', pattern: 'map' },
  { page: 'credit', pattern: 'credit' },
  { page: 'api', pattern: 'api' },
  { page: 'countries', pattern: 'countries' },
  { page: 'country', pattern: 'countries/:isoCode', params: { isoCode: /^[a-zA-Z]{2}$/ } },
  { page: 'versions', pattern: 'versions' },
  { page: 'version', pattern: 'versions/:version', params: { version: /^\d+\.\d+\.\d+$/ } },
  { page: 'rankings', pattern: 'rankings' },
  { page: 'records', pattern: 'records' },
  { page: 'reports', pattern: 'reports' },
  { page: 'report', pattern: 'reports/:period', params: { period: /^\d{4}(-(0[1-9]|1[0-2]))?$/ } },
  { page: 'about', pattern: 'about' },
  { page: 'methodology', pattern: 'about/data' },
  { page: 'privacy', pattern: 'privacy' },
  { page: 'contact', pattern: 'contact' },
];

export interface Route {
  page: PageName;
  params: Record<string, string>;
}

export interface ParsedPath {
  /** The language the address names, or null when it has no language prefix. */
  language: string | null;
  /** The address without its language prefix, always starting with "/" and without a trailing one. */
  path: string;
  /** null when no page lives at this address. */
  route: Route | null;
}

function matchPattern({ page, pattern, params }: RoutePattern, segments: string[]): Route | null {
  const expected = pattern === '' ? [] : pattern.split('/');
  if (expected.length !== segments.length) return null;

  const values: Record<string, string> = {};
  for (let i = 0; i < expected.length; i += 1) {
    if (!expected[i].startsWith(':')) {
      if (expected[i] !== segments[i]) return null;
      continue;
    }
    const name = expected[i].slice(1);
    if (!params?.[name]?.test(segments[i])) return null;
    values[name] = segments[i];
  }
  return { page, params: values };
}

function matchRoute(segments: string[]) {
  for (const pattern of ROUTE_PATTERNS) {
    const route = matchPattern(pattern, segments);
    if (route) return route;
  }
  return null;
}

export function parsePath(pathname: string): ParsedPath {
  const segments = pathname.split('/').filter(Boolean);
  const language = segments.length > 0 ? languageOfUrlCode(segments[0]) : null;
  const rest = language ? segments.slice(1) : segments;
  return { language, path: `/${rest.join('/')}`, route: matchRoute(rest) };
}

/** The address of a page, without a language prefix. */
export function pathOf(page: PageName, params: Record<string, string | number> = {}) {
  const pattern = ROUTE_PATTERNS.find((entry) => entry.page === page);
  if (!pattern) throw new Error(`unknown page ${page}`);
  const path = pattern.pattern
    .split('/')
    .map((segment) => (segment.startsWith(':') ? String(params[segment.slice(1)]) : segment))
    .join('/');
  return `/${path}`;
}

/** Puts the language prefix on an address that has none. English and incomplete languages have no prefix. */
export function localizedPath(path: string, language: string | null | undefined) {
  const urlCode = urlCodeOf(language);
  if (!urlCode) return path;
  return path === '/' ? `/${urlCode}` : `/${urlCode}${path}`;
}

export function absoluteUrl(path: string) {
  return `${SITE_ORIGIN}${path}`;
}

/** The address a route should be known by: the same page always gets the same spelling. */
export function canonicalPath({ page, params }: Route) {
  if (page === 'country') return pathOf(page, { isoCode: params.isoCode.toLowerCase() });
  return pathOf(page, params);
}

/**
 * Where the language menu should go after a switch, or null when the address can stay.
 * An address with a language prefix would switch the language straight back, so it moves to the
 * same page in the new language. A language without addresses of its own goes to the plain one.
 */
export function languageSwitchPath(pathname: string, language: string) {
  const { language: current, path } = parsePath(pathname);
  if (!current) return null;
  return localizedPath(path, language);
}
