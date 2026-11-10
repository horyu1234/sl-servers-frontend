// The <head> of a page: title, description and the links that tell search engines which
// address is the original and which ones are its translations.
import { DEFAULT_LANGUAGE, PREFIXED_LANGUAGES, hreflangOf } from './locales';
import { absoluteUrl, localizedPath } from './routes';

export const SITE_NAME = 'SCP: Secret Laboratory Server List';

export function withSiteName(title: string) {
  return `${title} · ${SITE_NAME}`;
}

export interface PageHead {
  title: string;
  description: string;
  /** Value of <html lang>. */
  lang: string;
  canonical: string;
  /** Empty for a page that must not be indexed. */
  alternates: { hreflang: string; href: string }[];
  noindex: boolean;
}

interface HeadInput {
  /** The whole document title. */
  title: string;
  description: string;
  /** Address without a language prefix. */
  path: string;
  /** The language of the address prefix, or null on an address without one. */
  urlLanguage: string | null;
  /**
   * Languages the page's own text exists in. Leave out for pages built from the locale files,
   * which every language with addresses has in full.
   */
  languages?: string[];
  noindex?: boolean;
}

export function buildHead({ title, description, path, urlLanguage, languages, noindex = false }: HeadInput): PageHead {
  const translated = PREFIXED_LANGUAGES.filter((language) => !languages || languages.includes(language));
  // A prefixed address whose text falls back to English points at the English page.
  const ownLanguage = urlLanguage && translated.includes(urlLanguage) ? urlLanguage : null;
  const defaultUrl = absoluteUrl(path);

  return {
    title,
    description,
    lang: hreflangOf(ownLanguage ?? DEFAULT_LANGUAGE),
    canonical: absoluteUrl(localizedPath(path, ownLanguage)),
    alternates: noindex ? [] : [
      { hreflang: 'x-default', href: defaultUrl },
      { hreflang: hreflangOf(DEFAULT_LANGUAGE), href: defaultUrl },
      ...translated.map((language) => ({
        hreflang: hreflangOf(language),
        href: absoluteUrl(localizedPath(path, language)),
      })),
    ],
    noindex,
  };
}
