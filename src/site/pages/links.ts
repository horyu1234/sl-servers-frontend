import type { SiteContext } from '../context';
import type { Cell } from '../pageModel';
import { pathOf } from '../routes';

/** The sections of the site, as links. The home page and the footer both list them. */
export function siteLinks(ctx: SiteContext): { browse: Cell[]; statistics: Cell[]; site: Cell[] } {
  const { t } = ctx;
  return {
    browse: [
      { text: t('navbar.server-list'), href: pathOf('list') },
      { text: t('navbar.rankings'), href: pathOf('rankings') },
      { text: t('navbar.countries'), href: pathOf('countries') },
      { text: t('navbar.all-server-map'), href: pathOf('map') },
    ],
    statistics: [
      { text: t('navbar.all-stats'), href: pathOf('stats') },
      { text: t('navbar.records'), href: pathOf('records') },
      { text: t('navbar.versions'), href: pathOf('versions') },
      { text: t('navbar.reports'), href: pathOf('reports') },
    ],
    site: [
      { text: t('navbar.about'), href: pathOf('about') },
      { text: t('navbar.methodology'), href: pathOf('methodology') },
      { text: 'API', href: pathOf('api') },
      { text: t('navbar.credit'), href: pathOf('credit') },
      { text: t('navbar.privacy'), href: pathOf('privacy') },
      { text: t('navbar.contact'), href: pathOf('contact') },
      { text: t('navbar.funding'), href: pathOf('funding') },
    ],
  };
}
