import { describe, expect, it } from 'vitest';
import { countries, reports, versions } from '../site/pages/testData';
import { API_PATHS } from './pages';
import { pagesSitemap, serversSitemap, sitemapIndex } from './sitemap';
import { fakeApi } from './testUtils';

function locs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

describe('sitemaps', () => {
  it('index both sitemap files', () => {
    expect(locs(sitemapIndex())).toEqual([
      'https://scplist.kr/sitemaps/pages.xml',
      'https://scplist.kr/sitemaps/servers.xml',
    ]);
  });

  it('list the fixed pages in each language even when the API is silent', async () => {
    const urls = locs(await pagesSitemap(fakeApi({})));

    expect(urls).toEqual(expect.arrayContaining([
      'https://scplist.kr/',
      'https://scplist.kr/ko',
      'https://scplist.kr/rankings',
      'https://scplist.kr/ko/rankings',
      'https://scplist.kr/privacy',
      'https://scplist.kr/ko/privacy',
      'https://scplist.kr/about/data',
    ]));
    expect(urls.some((url) => url.includes(':'.concat('serverId')))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('add every country, version and report the API knows', async () => {
    const xml = await pagesSitemap(fakeApi({
      [API_PATHS.countries]: countries,
      [API_PATHS.versions]: versions,
      [API_PATHS.reports]: reports,
    }));

    expect(locs(xml)).toEqual(expect.arrayContaining([
      'https://scplist.kr/countries/kr',
      'https://scplist.kr/ko/countries/kr',
      'https://scplist.kr/versions/14.2.9',
      'https://scplist.kr/reports/2026-10',
      'https://scplist.kr/reports/2025',
    ]));
  });

  it('tie the translations of an address together', async () => {
    const xml = await pagesSitemap(fakeApi({}));
    const entry = xml.split('\n').find((line) => line.includes('<loc>https://scplist.kr/ko/stats</loc>'));

    expect(entry).toContain('<xhtml:link rel="alternate" hreflang="x-default" href="https://scplist.kr/stats"/>');
    expect(entry).toContain('<xhtml:link rel="alternate" hreflang="ko" href="https://scplist.kr/ko/stats"/>');
  });

  it('list the servers that are online', async () => {
    const xml = await serversSitemap(fakeApi({ [API_PATHS.onlineServers]: [{ serverId: 7 }, { serverId: 8 }] }));

    expect(locs(xml)).toEqual([
      'https://scplist.kr/servers/7',
      'https://scplist.kr/ko/servers/7',
      'https://scplist.kr/servers/8',
      'https://scplist.kr/ko/servers/8',
    ]);
  });

  it('are still valid XML without any server', async () => {
    const xml = await serversSitemap(fakeApi({}));

    expect(new DOMParser().parseFromString(xml, 'application/xml').querySelector('parsererror')).toBeNull();
    expect(locs(xml)).toEqual([]);
  });
});
