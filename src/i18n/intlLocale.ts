// Some locale file names are not tags Intl can use: it reads ee as Ewe, does not know dk or lij,
// and throws on zh-LZH. Each of these maps to the closest language Intl can format.
const INTL_LOCALES: Record<string, string> = {
  'dk-DK': 'da-DK',
  'ee-EE': 'et-EE',
  'lij-IT': 'it-IT',
  'zh-LZH': 'zh-CN',
};

export function intlLocale(language: string) {
  return INTL_LOCALES[language] ?? language;
}

export default intlLocale;
