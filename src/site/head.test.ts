import { describe, expect, it } from 'vitest';
import { buildHead, withSiteName } from './head';

const base = { title: 'T', description: 'D', path: '/stats' };

describe('buildHead', () => {
  it('points an address without a prefix at itself and lists every translation', () => {
    const head = buildHead({ ...base, urlLanguage: null });

    expect(head.lang).toBe('en');
    expect(head.canonical).toBe('https://scplist.kr/stats');
    expect(head.alternates).toEqual(expect.arrayContaining([
      { hreflang: 'x-default', href: 'https://scplist.kr/stats' },
      { hreflang: 'en', href: 'https://scplist.kr/stats' },
      { hreflang: 'ko', href: 'https://scplist.kr/ko/stats' },
    ]));
  });

  it('points a Korean address at itself', () => {
    const head = buildHead({ ...base, urlLanguage: 'ko-KR' });

    expect(head.lang).toBe('ko');
    expect(head.canonical).toBe('https://scplist.kr/ko/stats');
  });

  it('points a prefixed page whose text is not translated at the English page', () => {
    const head = buildHead({ ...base, urlLanguage: 'ko-KR', languages: ['en-US'] });

    expect(head.lang).toBe('en');
    expect(head.canonical).toBe('https://scplist.kr/stats');
    expect(head.alternates.map((alternate) => alternate.hreflang)).toEqual(['x-default', 'en']);
  });

  it('offers no translations of a page that must not be indexed', () => {
    const head = buildHead({ ...base, urlLanguage: null, noindex: true });

    expect(head.noindex).toBe(true);
    expect(head.alternates).toEqual([]);
  });

  it('uses the root address for the home page of each language', () => {
    expect(buildHead({ ...base, path: '/', urlLanguage: 'ko-KR' }).canonical).toBe('https://scplist.kr/ko');
  });
});

describe('withSiteName', () => {
  it('ends a title with the name of the site', () => {
    expect(withSiteName('Rankings')).toBe('Rankings · SCP: Secret Laboratory Server List');
  });
});
