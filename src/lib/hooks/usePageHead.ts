import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildHead, withSiteName } from '../../site/head';
import type { PageHead } from '../../site/head';
import { hreflangOf } from '../../site/locales';
import type { PageModel } from '../../site/pageModel';
import { canonicalPath, parsePath } from '../../site/routes';

function upsert<T extends Element>(selector: string, create: () => T) {
  const found = document.head.querySelector<T>(selector);
  if (found) return found;
  const element = create();
  document.head.appendChild(element);
  return element;
}

function meta(attribute: 'name' | 'property', key: string, content: string) {
  upsert(`meta[${attribute}="${key}"]`, () => {
    const element = document.createElement('meta');
    element.setAttribute(attribute, key);
    return element;
  }).setAttribute('content', content);
}

/** Writes a head into the document. The edge function writes the same tags into the first HTML. */
export function applyHead(head: PageHead) {
  document.title = head.title;
  document.documentElement.lang = head.lang;
  meta('name', 'description', head.description);
  meta('property', 'og:title', head.title);
  meta('property', 'og:description', head.description);
  meta('property', 'og:url', head.canonical);

  upsert('link[rel="canonical"]', () => {
    const element = document.createElement('link');
    element.rel = 'canonical';
    return element;
  }).setAttribute('href', head.canonical);

  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove());
  for (const { hreflang, href } of head.alternates) {
    const element = document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = hreflang;
    element.href = href;
    document.head.appendChild(element);
  }

  const robots = document.head.querySelector('meta[name="robots"]');
  if (head.noindex) meta('name', 'robots', 'noindex');
  else robots?.remove();
}

/**
 * Keeps the document head in step with the page on screen. While the page's data is still
 * loading there is no model yet, and only the title changes.
 */
export function usePageHead(model: PageModel | null, loadingTitle?: string) {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const shownLanguage = i18n.resolvedLanguage ?? i18n.language;
  const title = model?.title ?? (loadingTitle ? withSiteName(loadingTitle) : null);
  const description = model?.description;
  const noindex = model?.noindex;
  const languages = model?.languages?.join(',');

  useEffect(() => {
    if (title === null) return;
    if (description === undefined) {
      document.title = title;
      return;
    }
    const { route, language, path } = parsePath(pathname);
    const head = buildHead({
      title,
      description,
      path: route ? canonicalPath(route) : path,
      urlLanguage: language,
      languages: languages?.split(','),
      noindex: noindex || route === null,
    });
    // Without a language prefix the text is in the visitor's own language, as on the edge.
    if (!language && shownLanguage) head.lang = hreflangOf(shownLanguage);
    applyHead(head);
  }, [pathname, title, description, noindex, languages, shownLanguage]);
}

export default usePageHead;
