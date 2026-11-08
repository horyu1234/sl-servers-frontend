import i18n from "i18next"
import {initReactI18next} from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import enUS from './locale/en-US.json';
import koKR from './locale/ko-KR.json';
import ruRU from './locale/ru-RU.json';
import ukUA from './locale/uk-UA.json';
import zhCN from './locale/zh-CN.json';
import zhLZH from './locale/zh-LZH.json';
import zhTW from './locale/zh-TW.json';
import esES from './locale/es-ES.json';
import plPL from './locale/pl-PL.json';
import caES from './locale/ca-ES.json';
import frFR from './locale/fr-FR.json';
import trTR from './locale/tr-TR.json';
import thTH from './locale/th-TH.json';
import itIT from './locale/it-IT.json';
import lijIT from './locale/lij-IT.json';
import deDE from './locale/de-DE.json';
import bgBG from './locale/bg-BG.json';
import nbNo from './locale/nb-NO.json';
import svSV from './locale/sv-SV.json';
import dkDk from './locale/dk-DK.json';
import eoEo from './locale/eo-EO.json';
import fiFi from './locale/fi-FI.json';
import eeEE from './locale/ee-EE.json';
import isIS from './locale/is-IS.json';
import lvLV from './locale/lv-LV.json';
import ptBR from './locale/pt-BR.json';
import csCZ from './locale/cs-CZ.json';
import {SITE_LANGUAGES, toSiteLanguage} from './siteLanguage';

const resource = {
    "en-US": {
        translation: enUS
    },
    "ko-KR": {
        translation: koKR
    },
    "ru-RU": {
        translation: ruRU
    },
    "uk-UA": {
        translation: ukUA
    },
    "zh-CN": {
        translation: zhCN
    },
    "zh-LZH": {
        translation: zhLZH
    },
    "zh-TW": {
        translation: zhTW
    },
    "es-ES": {
        translation: esES
    },
    "pl-PL": {
        translation: plPL
    },
    "ca-ES": {
        translation: caES
    },
    "fr-FR": {
        translation: frFR
    },
    "tr-TR": {
        translation: trTR
    },
    "th-TH": {
        translation: thTH
    },
    "it-IT": {
        translation: itIT
    },
    "lij-IT": {
        translation: lijIT
    },
    "de-DE": {
        translation: deDE
    },
    "bg-BG": {
        translation: bgBG
    },
    "nb-NO": {
        translation: nbNo
    },
    "sv-SV": {
        translation: svSV
    },
    "dk-DK": {
        translation: dkDk
    },
    "eo-EO": {
        translation: eoEo
    },
    "fi-FI": {
        translation: fiFi
    },
    "ee-EE": {
        translation: eeEE
    },
    "is-IS": {
        translation: isIS
    },
    "lv-LV": {
        translation: lvLV
    },
    "pt-BR": {
        translation: ptBR
    },
    "cs-CZ": {
        translation: csCZ
    },
}

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
        resources: resource,
        supportedLngs: SITE_LANGUAGES,
        fallbackLng: 'en-US',
        debug: false,
        interpolation: {
            escapeValue: false
        },
        detection: languageDetectorOption
    }).then(r => {
});

export default i18n;
