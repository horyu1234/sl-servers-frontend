import { describe, it, expect, afterAll, afterEach, beforeEach, vi } from 'vitest';
import i18n from './i18n';
import languages from '../data/language.json';

const locales = import.meta.glob('./locale/*.json', { eager: true });

const SAVED_LANGUAGE = 'user.language';

describe('i18n languages', () => {
  afterAll(() => i18n.changeLanguage('en-US'));

  it.each(languages.map((language) => language.code))('resolves %s to its own locale file', async (code) => {
    const { navbar } = locales[`./locale/${code}.json`].default;

    await i18n.changeLanguage(code);

    expect(i18n.resolvedLanguage).toBe(code);
    expect(i18n.t('navbar.server-list')).toBe(navbar['server-list']);
  });

  it('keeps English as the fallback for keys a locale lacks', () => {
    expect(i18n.options.fallbackLng).toContain('en-US');
  });
});

describe('language detection', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${SAVED_LANGUAGE}=; max-age=0; path=/`;
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => i18n.changeLanguage('en-US'));

  async function visit({ browser, cookie, storage }) {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(browser);
    // Browsers repeat their first language here, and the detector reads it after the list.
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(browser[0]);
    if (cookie) document.cookie = `${SAVED_LANGUAGE}=${cookie}; path=/`;
    if (storage) localStorage.setItem(SAVED_LANGUAGE, storage);

    await i18n.changeLanguage();

    expect(i18n.resolvedLanguage).toBe(i18n.language);
    return i18n.language;
  }

  it('shows the Korean locale to a browser that lists ko before ko-KR', async () => {
    await visit({ browser: ['ko', 'ko-KR'] });

    expect(i18n.language).toBe('ko-KR');
    expect(i18n.t('navbar.server-list')).toBe(locales['./locale/ko-KR.json'].default.navbar['server-list']);
    expect(localStorage.getItem(SAVED_LANGUAGE)).toBe('ko-KR');
    expect(document.cookie).toContain(`${SAVED_LANGUAGE}=ko-KR`);
  });

  it.each([
    ['en', 'en-US'],
    ['ko', 'ko-KR'],
    ['ru', 'ru-RU'],
    ['uk', 'uk-UA'],
    ['zh', 'zh-CN'],
    ['lzh', 'zh-LZH'],
    ['es', 'es-ES'],
    ['pl', 'pl-PL'],
    ['ca', 'ca-ES'],
    ['fr', 'fr-FR'],
    ['tr', 'tr-TR'],
    ['th', 'th-TH'],
    ['it', 'it-IT'],
    ['lij', 'lij-IT'],
    ['de', 'de-DE'],
    ['bg', 'bg-BG'],
    ['nb', 'nb-NO'],
    ['sv', 'sv-SV'],
    ['da', 'dk-DK'],
    ['fi', 'fi-FI'],
    ['et', 'ee-EE'],
    ['is', 'is-IS'],
    ['lv', 'lv-LV'],
    ['pt', 'pt-BR'],
    ['cs', 'cs-CZ'],
  ])('maps the language code %s to %s', async (code, locale) => {
    expect(await visit({ browser: [code] })).toBe(locale);
  });

  it.each([
    ['da-DK', 'dk-DK'],
    ['et-EE', 'ee-EE'],
    ['nb-NO', 'nb-NO'],
    ['no', 'nb-NO'],
    ['no-NO', 'nb-NO'],
    ['nn', 'nb-NO'],
    ['nn-NO', 'nb-NO'],
    ['sv-SE', 'sv-SV'],
    ['sv-FI', 'sv-SV'],
    ['pt-PT', 'pt-BR'],
    ['de-AT', 'de-DE'],
    ['fr-CA', 'fr-FR'],
    ['es-419', 'es-ES'],
    ['ca-ES-valencia', 'ca-ES'],
  ])('maps the regional code %s to %s', async (code, locale) => {
    expect(await visit({ browser: [code] })).toBe(locale);
  });

  it.each([
    ['zh-CN', 'zh-CN'],
    ['zh-Hans', 'zh-CN'],
    ['zh-Hans-HK', 'zh-CN'],
    ['zh-SG', 'zh-CN'],
    ['zh-TW', 'zh-TW'],
    ['zh-Hant', 'zh-TW'],
    ['zh-Hant-HK', 'zh-TW'],
    ['zh-HK', 'zh-TW'],
    ['zh-MO', 'zh-TW'],
  ])('picks the script of %s', async (code, locale) => {
    expect(await visit({ browser: [code] })).toBe(locale);
  });

  it.each(['en-GB', 'en-AU', 'en-CA'])('falls back from %s to the English locale', async (code) => {
    expect(await visit({ browser: [code] })).toBe('en-US');
  });

  it.each([
    ['Japanese', 'ja'],
    ['Ewe, which shares its code with the name of the Estonian file', 'ee'],
    ['Ewe with a region', 'ee-GH'],
  ])('falls back to English for %s', async (_name, code) => {
    expect(await visit({ browser: [code] })).toBe('en-US');
  });

  it.each([
    [['ko', 'en-US', 'en'], 'ko-KR'],
    [['de', 'en-US', 'en'], 'de-DE'],
    [['en-GB', 'ko-KR'], 'en-US'],
    [['ja', 'ko'], 'ko-KR'],
    [['ee', 'ko'], 'ko-KR'],
  ])('follows the order of %j', async (browser, locale) => {
    expect(await visit({ browser })).toBe(locale);
  });

  it.each([
    [{ browser: ['ko', 'ko-KR'], cookie: 'ko', storage: 'ko' }, 'ko-KR'],
    [{ browser: ['de', 'en-US'], storage: 'de' }, 'de-DE'],
    [{ browser: ['en-US'], cookie: 'fr' }, 'fr-FR'],
    [{ browser: ['en-US'], cookie: 'da' }, 'dk-DK'],
    [{ browser: ['en-US'], storage: 'zh-HK' }, 'zh-TW'],
  ])('repairs the saved language of %j', async (visitor, locale) => {
    expect(await visit(visitor)).toBe(locale);
    expect(localStorage.getItem(SAVED_LANGUAGE)).toBe(locale);
    expect(document.cookie).toContain(`${SAVED_LANGUAGE}=${locale}`);
  });

  it('moves on to the browser when the saved language has no locale', async () => {
    expect(await visit({ browser: ['ko-KR'], cookie: 'ja', storage: 'ja' })).toBe('ko-KR');
  });

  it.each(languages.map((language) => language.code))('keeps %s once it is saved', async (code) => {
    const browser = [code === 'ko-KR' ? 'en-US' : 'ko-KR'];

    expect(await visit({ browser, cookie: code })).toBe(code);
  });
});
