import { describe, expect, it } from 'vitest';
import languages from '../data/language.json';
import { TRANSLATIONS } from '../i18n/resources';
import { PREFIXED_LANGUAGES, hreflangOf, isFullyTranslated, languageOfUrlCode, urlCodeOf } from './locales';
import { ROUTE_PATTERNS } from './routes';

describe('language addresses', () => {
  it('gives Korean its own addresses, because its locale file is complete', () => {
    expect(isFullyTranslated('ko-KR')).toBe(true);
    expect(PREFIXED_LANGUAGES).toContain('ko-KR');
    expect(urlCodeOf('ko-KR')).toBe('ko');
    expect(languageOfUrlCode('ko')).toBe('ko-KR');
  });

  it('keeps English at the root', () => {
    expect(PREFIXED_LANGUAGES).not.toContain('en-US');
    expect(urlCodeOf('en-US')).toBeNull();
    expect(languageOfUrlCode('en')).toBeNull();
  });

  it('gives no addresses to a language that misses a key', () => {
    const incomplete = languages.map((language) => language.code).filter((code) => !isFullyTranslated(code));

    for (const code of incomplete) {
      expect(PREFIXED_LANGUAGES).not.toContain(code);
      expect(urlCodeOf(code)).toBeNull();
    }
  });

  it('counts a plural key once, so a language with a single plural form is still complete', () => {
    // Korean has only the "other" form where English has "one" and "other".
    expect(TRANSLATIONS['ko-KR']).not.toHaveProperty('pages.versions.days_one');
    expect(isFullyTranslated('ko-KR')).toBe(true);
  });

  it('does not know a language without a locale file', () => {
    expect(isFullyTranslated('ja-JP')).toBe(false);
    expect(urlCodeOf(null)).toBeNull();
  });

  it('never uses a first address segment that a page already owns', () => {
    const pageSegments = new Set(ROUTE_PATTERNS.map(({ pattern }) => pattern.split('/')[0]));

    for (const language of PREFIXED_LANGUAGES) {
      expect(pageSegments).not.toContain(urlCodeOf(language));
    }
  });

  it.each([
    ['en-US', 'en'],
    ['ko-KR', 'ko'],
    ['zh-CN', 'zh-Hans'],
    ['zh-TW', 'zh-Hant'],
    ['pt-BR', 'pt-BR'],
    ['dk-DK', 'da'],
    ['ee-EE', 'et'],
  ])('writes %s as hreflang %s', (language, hreflang) => {
    expect(hreflangOf(language)).toBe(hreflang);
  });

  it('has a tag every search engine accepts for each site language', () => {
    for (const { code } of languages) {
      expect(() => new Intl.Locale(hreflangOf(code))).not.toThrow();
    }
  });
});
