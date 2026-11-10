import i18n from './i18n';
import {countryName} from '../site/countryName';

const getCountryName = (isoCode: string) => countryName(isoCode, i18n.resolvedLanguage ?? i18n.language);

export default getCountryName;
