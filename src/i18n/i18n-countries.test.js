import { describe, it, expect, afterAll } from 'vitest';
import i18n from './i18n';
import getCountryName from './i18n-countries';
import { intlLocale } from './intlLocale';
import languages from '../data/language.json';

describe('getCountryName', () => {
  afterAll(() => i18n.changeLanguage('en-US'));

  it.each([
    ['en-US', 'KR', 'South Korea'],
    ['en-US', 'GB', 'United Kingdom'],
    ['en-US', 'HK', 'Hong Kong'],
    ['ko-KR', 'KR', '대한민국'],
    ['de-DE', 'KR', 'Südkorea'],
    ['dk-DK', 'KR', 'Sydkorea'],
    ['ee-EE', 'KR', 'Lõuna-Korea'],
    ['zh-LZH', 'KR', '韩国'],
  ])('names the country in %s', async (language, code, name) => {
    await i18n.changeLanguage(language);

    expect(getCountryName(code)).toBe(name);
  });

  it('follows the language on screen when the requested one has no locale file', async () => {
    await i18n.changeLanguage('ko');

    expect(i18n.resolvedLanguage).toBe('en-US');
    expect(getCountryName('KR')).toBe('South Korea');
  });

  it('does not throw on a code that is not a region', async () => {
    await i18n.changeLanguage('en-US');

    expect(() => getCountryName(null)).not.toThrow();
    expect(() => getCountryName('')).not.toThrow();
  });
});

describe('intlLocale', () => {
  it.each(languages.map((language) => language.code))('gives Intl a usable tag for %s', (code) => {
    const locale = intlLocale(code);

    expect(() => new Intl.DateTimeFormat(locale)).not.toThrow();
    expect(() => new Intl.DisplayNames(locale, { type: 'region' })).not.toThrow();
  });

  it('does not read Estonian as Ewe', () => {
    expect(new Intl.DateTimeFormat(intlLocale('ee-EE')).resolvedOptions().locale).toBe('et-EE');
  });
});
