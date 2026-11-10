import { getName, overwrite } from 'country-list';
import { intlLocale } from '../i18n/intlLocale';

overwrite([{
  code: 'TW',
  name: 'Taiwan',
}]);

// The long form spells these out as "Hong Kong SAR China".
const SHORT_NAME_REGIONS = new Set(['HK', 'MO']);
const regionNames = new Map<string, Intl.DisplayNames>();

function regionNamesFor(locale: string, style: 'long' | 'short') {
  const key = `${locale}|${style}`;
  let names = regionNames.get(key);
  if (!names) {
    names = new Intl.DisplayNames(locale, { type: 'region', style, fallback: 'none' });
    regionNames.set(key, names);
  }
  return names;
}

/** The name of a country in a site language. undefined when the code is not a country. */
export function countryName(isoCode: string, language: string) {
  const style = SHORT_NAME_REGIONS.has(isoCode) ? 'short' : 'long';
  try {
    return regionNamesFor(intlLocale(language), style).of(isoCode) ?? getName(isoCode);
  } catch {
    // Intl throws on anything that is not a region code.
    return undefined;
  }
}
