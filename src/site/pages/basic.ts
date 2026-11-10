// Pages whose text does not depend on much data: the home page, the hubs and the 404 page.
import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { homeCrumb } from '../pageModel';
import type { PageModel, Section } from '../pageModel';
import { pathOf } from '../routes';
import { countryCell, serverCell } from './countries';
import { siteLinks } from './links';
import type { CountriesResponse, GlobalHistoryResponse, RankingsResponse } from '../../types/api';

const HOME_SERVERS = 30;
const HOME_COUNTRIES = 20;

interface HomeData {
  rankings?: RankingsResponse | null;
  countries?: CountriesResponse | null;
}

export function listModel(ctx: SiteContext, { rankings, countries }: HomeData = {}): PageModel {
  const { t } = ctx;
  const links = siteLinks(ctx);
  const sections: Section[] = [
    { heading: t('pages.home.explore'), links: [...links.browse.slice(1), ...links.statistics, ...links.site.slice(0, 3)] },
  ];
  if (rankings && rankings.popular.length > 0) {
    sections.push({
      heading: t('pages.rankings.popular'),
      links: rankings.popular.slice(0, HOME_SERVERS).map(serverCell),
    });
  }
  if (countries && countries.countries.length > 0) {
    sections.push({
      heading: t('navbar.countries'),
      links: countries.countries.slice(0, HOME_COUNTRIES).map((country) => countryCell(ctx, country.isoCode)),
    });
  }

  return {
    title: t('pages.home.title'),
    description: t('pages.home.description'),
    heading: t('pages.home.heading'),
    intro: [t('pages.home.intro')],
    sections,
    breadcrumbs: [{ text: t('navbar.server-list') }],
  };
}

export function statsModel(ctx: SiteContext, history?: GlobalHistoryResponse | null): PageModel {
  const { t } = ctx;
  const intro = [t('pages.stats.intro')];
  const latest = history?.latest;
  if (latest) {
    intro.push(t('pages.records.latest', {
      date: ctx.date(latest.date),
      peak: ctx.number(latest.peak),
      rank: ctx.number(latest.rank),
      days: ctx.number(latest.totalDays),
    }));
  }

  return {
    title: withSiteName(t('pages.stats.title')),
    description: t('pages.stats.description'),
    heading: t('navbar.all-stats'),
    intro,
    sections: [{ heading: t('pages.home.explore'), links: siteLinks(ctx).statistics.slice(1) }],
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.all-stats') }],
  };
}

export function mapModel(ctx: SiteContext): PageModel {
  const { t } = ctx;
  return {
    title: withSiteName(t('all-server-map.title')),
    description: t('pages.map.description'),
    heading: t('all-server-map.title'),
    intro: [t('pages.map.intro')],
    sections: [{ links: [{ text: t('navbar.countries'), href: pathOf('countries') }] }],
    breadcrumbs: [homeCrumb(ctx), { text: t('all-server-map.title') }],
  };
}

export function creditModel(ctx: SiteContext): PageModel {
  const { t } = ctx;
  return {
    title: withSiteName(t('navbar.credit')),
    description: t('pages.credit.description'),
    heading: t('navbar.credit'),
    intro: [t('credit.site-license')],
    sections: [],
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.credit') }],
  };
}

export function notFoundModel(ctx: SiteContext): PageModel {
  const { t } = ctx;
  return {
    title: withSiteName('404'),
    description: t('general.not-found'),
    heading: '404',
    intro: [t('general.not-found')],
    sections: [{ links: [{ text: t('navbar.server-list'), href: pathOf('list') }] }],
    breadcrumbs: [homeCrumb(ctx), { text: '404' }],
    noindex: true,
  };
}
