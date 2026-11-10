import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createSiteContext } from '../../site/context';
import type { SiteContext, Translate } from '../../site/context';
import { parsePath } from '../../site/routes';
import { clockOffsetMinutes } from '../../site/timeZone';

/** The translator, formatters and links for the language on screen, on the clock of this browser. */
export function useSiteContext(): SiteContext {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const urlLanguage = parsePath(pathname).language;
  const utcOffsetMinutes = clockOffsetMinutes();

  return useMemo(() => {
    const translate: Translate = (key, values) => t(key, values ?? {});
    return createSiteContext(language, translate, urlLanguage, utcOffsetMinutes);
  }, [language, t, urlLanguage, utcOffsetMinutes]);
}

export default useSiteContext;
