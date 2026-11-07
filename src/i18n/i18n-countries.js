import {getName, overwrite} from 'country-list';
import i18n from './i18n';
import {intlLocale} from './intlLocale';

overwrite([{
    code: 'TW',
    name: 'Taiwan'
}])

// The long form spells these out as "Hong Kong SAR China".
const SHORT_NAME_REGIONS = new Set(['HK', 'MO']);
const regionNames = new Map();

function regionNamesFor(locale, style) {
    const key = `${locale}|${style}`;
    if (!regionNames.has(key)) {
        regionNames.set(key, new Intl.DisplayNames(locale, {type: 'region', style, fallback: 'none'}));
    }
    return regionNames.get(key);
}

const getCountryName = (isoCode) => {
    const style = SHORT_NAME_REGIONS.has(isoCode) ? 'short' : 'long';
    try {
        return regionNamesFor(intlLocale(i18n.resolvedLanguage ?? i18n.language), style).of(isoCode) ?? getName(isoCode);
    } catch {
        // Intl throws on anything that is not a region code.
        return undefined;
    }
}

export default getCountryName;
