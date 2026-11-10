// Which languages have their own addresses, such as /ko/stats.
//
// Everything in src/site runs in the browser and in the edge function (functions/), so it
// must not touch the DOM or import React.
import languages from '../data/language.json';
import { DEFAULT_LANGUAGE, TRANSLATIONS } from '../i18n/resources';
import type { TranslationTree } from '../i18n/resources';

// The address segment of each language. Locale file names such as dk-DK or ee-EE are not
// language tags, so these are written out instead of derived.
const URL_CODES: Record<string, string> = {
  'en-US': 'en',
  'ko-KR': 'ko',
  'ru-RU': 'ru',
  'uk-UA': 'uk',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
  'zh-LZH': 'lzh',
  'es-ES': 'es',
  'pl-PL': 'pl',
  'ca-ES': 'ca',
  'fr-FR': 'fr',
  'tr-TR': 'tr',
  'th-TH': 'th',
  'it-IT': 'it',
  'lij-IT': 'lij',
  'de-DE': 'de',
  'bg-BG': 'bg',
  'nb-NO': 'nb',
  'sv-SV': 'sv',
  'dk-DK': 'da',
  'eo-EO': 'eo',
  'fi-FI': 'fi',
  'ee-EE': 'et',
  'is-IS': 'is',
  'lv-LV': 'lv',
  'pt-BR': 'pt-br',
  'cs-CZ': 'cs',
};

// Search engines want the script for Chinese, and the region in upper case.
const HREFLANG_OVERRIDES: Record<string, string> = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'pt-BR': 'pt-BR',
};

const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
// Keys a complete language may leave out. The "45 days ago" phrases come from Intl wherever
// Intl knows the language, so most locale files do not spell them out (see formatAgo).
const OPTIONAL_KEYS = /^server-info\.offline-notice\.ago\./;

function translationKeys(tree: TranslationTree, prefix = '', keys = new Set<string>()) {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === 'string') keys.add(prefix + key.replace(PLURAL_SUFFIX, ''));
    else translationKeys(value, `${prefix}${key}.`, keys);
  }
  return keys;
}

/** True when the language translates every key the English file has. Plural forms count once. */
export function isFullyTranslated(language: string) {
  const translation = TRANSLATIONS[language];
  if (!translation) return false;
  const keys = translationKeys(translation);
  for (const key of translationKeys(TRANSLATIONS[DEFAULT_LANGUAGE])) {
    if (!keys.has(key) && !OPTIONAL_KEYS.test(key)) return false;
  }
  return true;
}

/**
 * Languages with their own addresses. A language gets them once its locale file is complete:
 * a half-translated page under /xx/ would be indexed as that language while reading as English.
 * English lives at the root, so it is not in this list.
 */
export const PREFIXED_LANGUAGES: string[] = languages
  .map((language) => language.code)
  .filter((code) => code !== DEFAULT_LANGUAGE && URL_CODES[code] !== undefined && isFullyTranslated(code));

const LANGUAGE_BY_URL_CODE = new Map(PREFIXED_LANGUAGES.map((code) => [URL_CODES[code], code]));

/** The language of an address segment such as "ko", or null when no language owns it. */
export function languageOfUrlCode(urlCode: string) {
  return LANGUAGE_BY_URL_CODE.get(urlCode) ?? null;
}

/** The address segment of a language, or null when it has none (English, or not complete yet). */
export function urlCodeOf(language: string | null | undefined) {
  if (!language || !LANGUAGE_BY_URL_CODE.has(URL_CODES[language])) return null;
  return URL_CODES[language];
}

/** The value for hreflang and for <html lang>. */
export function hreflangOf(language: string) {
  return HREFLANG_OVERRIDES[language] ?? URL_CODES[language] ?? 'en';
}

export { DEFAULT_LANGUAGE };
