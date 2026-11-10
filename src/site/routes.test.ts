import { describe, expect, it } from 'vitest';
import { absoluteUrl, canonicalPath, languageSwitchPath, localizedPath, parsePath, pathOf } from './routes';

describe('parsePath', () => {
  it.each([
    ['/', 'list', {}],
    ['/servers/101366', 'server', { serverId: '101366' }],
    ['/stats', 'stats', {}],
    ['/countries', 'countries', {}],
    ['/countries/kr', 'country', { isoCode: 'kr' }],
    ['/versions/14.2.9', 'version', { version: '14.2.9' }],
    ['/reports/2026-10', 'report', { period: '2026-10' }],
    ['/reports/2025', 'report', { period: '2025' }],
    ['/about/data', 'methodology', {}],
    ['/privacy', 'privacy', {}],
  ])('reads %s as the %s page', (pathname, page, params) => {
    expect(parsePath(pathname)).toEqual({ language: null, path: pathname, route: { page, params } });
  });

  it.each([
    '/servers/abc',
    '/servers/12/extra',
    '/countries/kor',
    '/versions/14.2',
    '/reports/2026-13',
    '/reports/26-10',
    '/nothing-here',
    '/en/stats',
  ])('finds no page at %s', (pathname) => {
    expect(parsePath(pathname).route).toBeNull();
  });

  it('reads the language prefix and leaves the rest as the page address', () => {
    expect(parsePath('/ko/servers/7')).toEqual({
      language: 'ko-KR',
      path: '/servers/7',
      route: { page: 'server', params: { serverId: '7' } },
    });
    expect(parsePath('/ko')).toEqual({ language: 'ko-KR', path: '/', route: { page: 'list', params: {} } });
  });

  it('treats a trailing slash as the same page', () => {
    expect(parsePath('/stats/').route).toEqual({ page: 'stats', params: {} });
    expect(parsePath('/stats/').path).toBe('/stats');
  });
});

describe('addresses', () => {
  it('builds the address of a page from its parameters', () => {
    expect(pathOf('list')).toBe('/');
    expect(pathOf('server', { serverId: 42 })).toBe('/servers/42');
    expect(pathOf('methodology')).toBe('/about/data');
  });

  it('puts the prefix of a language with addresses in front', () => {
    expect(localizedPath('/stats', 'ko-KR')).toBe('/ko/stats');
    expect(localizedPath('/', 'ko-KR')).toBe('/ko');
  });

  it('leaves the address alone for English, for an unfinished language and for none', () => {
    expect(localizedPath('/stats', 'en-US')).toBe('/stats');
    expect(localizedPath('/stats', 'ja-JP')).toBe('/stats');
    expect(localizedPath('/stats', null)).toBe('/stats');
  });

  it('spells a country address in lower case whatever was typed', () => {
    const { route } = parsePath('/countries/KR');

    expect(route && canonicalPath(route)).toBe('/countries/kr');
  });

  it('makes an absolute address on the production host', () => {
    expect(absoluteUrl('/ko/stats')).toBe('https://scplist.kr/ko/stats');
  });
});

describe('languageSwitchPath', () => {
  it('stays on an address without a language prefix, where the saved language decides', () => {
    expect(languageSwitchPath('/stats', 'ko-KR')).toBeNull();
    expect(languageSwitchPath('/', 'en-US')).toBeNull();
  });

  it('leaves a prefixed address for the plain one when English is picked', () => {
    expect(languageSwitchPath('/ko/servers/7', 'en-US')).toBe('/servers/7');
    expect(languageSwitchPath('/ko', 'en-US')).toBe('/');
  });

  it('leaves a prefixed address for the plain one when the new language has no addresses', () => {
    expect(languageSwitchPath('/ko/stats', 'ja-JP')).toBe('/stats');
  });

  it('keeps the page when the picked language is the one of the address', () => {
    expect(languageSwitchPath('/ko/stats', 'ko-KR')).toBe('/ko/stats');
  });
});
