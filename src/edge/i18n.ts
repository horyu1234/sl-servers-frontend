import i18next from 'i18next';
import { DEFAULT_LANGUAGE, RESOURCES } from '../i18n/resources';
import type { Translate } from '../site/context';

const translators = new Map<string, Translate>();

/** The same translations the site uses, for one language. Built once and kept for later requests. */
export function translatorFor(language: string): Translate {
  let translate = translators.get(language);
  if (!translate) {
    const instance = i18next.createInstance();
    // With the resources passed in, init finishes before it returns.
    instance.init({
      lng: language,
      fallbackLng: DEFAULT_LANGUAGE,
      resources: RESOURCES,
      interpolation: { escapeValue: false },
      initAsync: false,
    });
    translate = (key, values) => instance.t(key, values ?? {});
    translators.set(language, translate);
  }
  return translate;
}
