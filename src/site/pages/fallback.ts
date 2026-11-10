// What a data page says when its data did not arrive: the right title and where it sits in the
// site, without numbers. The edge function uses it so a slow API never holds a page back.
import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { homeCrumb } from '../pageModel';
import type { Cell, PageModel } from '../pageModel';
import { pathOf } from '../routes';
import type { Route } from '../routes';
import { periodLabel } from './reports';

function page(title: string, description: string, heading: string, breadcrumbs: Cell[]): PageModel {
  return { title: withSiteName(title), description, heading, intro: [], sections: [], breadcrumbs };
}

export function fallbackModel(ctx: SiteContext, { page: name, params }: Route): PageModel | null {
  const { t } = ctx;
  const home = homeCrumb(ctx);

  switch (name) {
    case 'server':
      return page(t('server-info.title'), t('pages.home.description'), t('server-info.title'), [home, { text: t('server-info.title') }]);
    case 'countries':
      return page(t('pages.countries.title'), t('pages.countries.description-empty'), t('pages.countries.heading'), [home, { text: t('navbar.countries') }]);
    case 'country': {
      const country = ctx.country(params.isoCode);
      const title = t('pages.country.title', { country });
      return page(title, t('pages.countries.description-empty'), title, [
        home,
        { text: t('navbar.countries'), href: pathOf('countries') },
        { text: country },
      ]);
    }
    case 'versions':
      return page(t('pages.versions.title'), t('pages.versions.description-empty'), t('pages.versions.heading'), [home, { text: t('navbar.versions') }]);
    case 'version':
      return page(
        t('pages.version.title', { version: params.version }),
        t('pages.versions.description-empty'),
        t('pages.version.heading', { version: params.version }),
        [home, { text: t('navbar.versions'), href: pathOf('versions') }, { text: params.version }],
      );
    case 'rankings':
      return page(t('pages.rankings.title'), t('pages.rankings.description-empty'), t('pages.rankings.heading'), [home, { text: t('navbar.rankings') }]);
    case 'records':
      return page(t('pages.records.title'), t('pages.records.description-empty'), t('pages.records.heading'), [home, { text: t('navbar.records') }]);
    case 'reports':
      return page(t('pages.reports.title'), t('pages.reports.description-empty'), t('pages.reports.heading'), [home, { text: t('navbar.reports') }]);
    case 'report': {
      const period = periodLabel(ctx, params.period);
      return page(
        t('pages.report.title', { period }),
        t('pages.reports.description-empty'),
        t('pages.report.heading', { period }),
        [home, { text: t('navbar.reports'), href: pathOf('reports') }, { text: period }],
      );
    }
    default:
      return null;
  }
}
