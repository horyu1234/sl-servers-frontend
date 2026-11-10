import i18n from "i18next"
import {initReactI18next} from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import {DEFAULT_LANGUAGE, RESOURCES} from './resources';
import {SITE_LANGUAGES, toSiteLanguage} from './siteLanguage';
import {parsePath} from '../site/routes';

const languageDetectorOption = {

    // order and from where user language should be detected
    order: ['cookie', 'localStorage', 'navigator'],

    // keys or params to lookup language from
    lookupCookie: 'user.language',
    lookupLocalStorage: 'user.language',

    // cache user language on
    caches: ['localStorage', 'cookie'],

    // browsers and older visits hold codes like ko or da, which are not locale file names
    convertDetectedLanguage: toSiteLanguage
}

i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: RESOURCES,
        supportedLngs: SITE_LANGUAGES,
        fallbackLng: DEFAULT_LANGUAGE,
        // An address like /ko/stats names its language, so it wins over the saved one.
        lng: parsePath(window.location.pathname).language ?? undefined,
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: languageDetectorOption
    }).then(r => {
});

export default i18n;
