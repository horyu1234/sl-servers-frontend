import { describe, it, expect, afterAll } from 'vitest';
import i18n from './i18n';
import languages from '../data/language.json';

const locales = import.meta.glob('./locale/*.json', { eager: true });

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
