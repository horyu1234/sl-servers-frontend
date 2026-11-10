// The locale files as one map. The site and the edge function both read it, so it must not
// import anything that needs a browser.
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

export type TranslationTree = { [key: string]: string | TranslationTree };

export const TRANSLATIONS: Record<string, TranslationTree> = {
    'en-US': enUS,
    'ko-KR': koKR,
    'ru-RU': ruRU,
    'uk-UA': ukUA,
    'zh-CN': zhCN,
    'zh-LZH': zhLZH,
    'zh-TW': zhTW,
    'es-ES': esES,
    'pl-PL': plPL,
    'ca-ES': caES,
    'fr-FR': frFR,
    'tr-TR': trTR,
    'th-TH': thTH,
    'it-IT': itIT,
    'lij-IT': lijIT,
    'de-DE': deDE,
    'bg-BG': bgBG,
    'nb-NO': nbNo,
    'sv-SV': svSV,
    'dk-DK': dkDk,
    'eo-EO': eoEo,
    'fi-FI': fiFi,
    'ee-EE': eeEE,
    'is-IS': isIS,
    'lv-LV': lvLV,
    'pt-BR': ptBR,
    'cs-CZ': csCZ,
};

export const DEFAULT_LANGUAGE = 'en-US';

/** The shape i18next takes as `resources`. */
export const RESOURCES = Object.fromEntries(
    Object.entries(TRANSLATIONS).map(([code, translation]) => [code, { translation }]),
);
