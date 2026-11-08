import languages from '../data/language.json';

export const SITE_LANGUAGES = languages.map((language) => language.code);

// Means "no locale" to i18next: it moves on to the visitor's next language, and no locale starts
// with it. A code passed through unchanged could still land on one, as ee would on ee-EE.
const NO_LOCALE = 'und';

// Language subtags that do not match the locale file names. ee is Ewe, not the Estonian ee-EE.
const LOCALE_BY_LANGUAGE: Record<string, string> = {
  da: 'dk-DK',
  ee: NO_LOCALE,
  et: 'ee-EE',
  lzh: 'zh-LZH',
  nn: 'nb-NO',
  no: 'nb-NO',
};

// Turns any code a browser or an older visit left behind into a locale file name. i18next matches
// exact names first across every code it was given, so without this ['ko', 'en-US'] ends up English.
export function toSiteLanguage(code: string) {
  if (SITE_LANGUAGES.includes(code)) return code;

  let locale;
  try {
    locale = new Intl.Locale(code);
  } catch {
    return NO_LOCALE;
  }

  const { language } = locale;
  if (language === 'zh') return locale.maximize().script === 'Hant' ? 'zh-TW' : 'zh-CN';
  return LOCALE_BY_LANGUAGE[language]
    ?? SITE_LANGUAGES.find((siteLanguage) => siteLanguage.startsWith(`${language}-`))
    ?? NO_LOCALE;
}
