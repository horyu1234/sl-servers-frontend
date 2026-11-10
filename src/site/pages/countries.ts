import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { busiestSlot, changeCell, homeCrumb, percentOf, signedPercent, toneOf, trend } from '../pageModel';
import type { Cell, PageModel, Section } from '../pageModel';
import { pathOf } from '../routes';
import { serverLabel } from './server';
import type { CountriesResponse, CountryDetailResponse, CountryStanding, RankedServer } from '../../types/api';

export function countryCell(ctx: SiteContext, isoCode: string): Cell {
  return {
    text: ctx.country(isoCode),
    href: pathOf('country', { isoCode: isoCode.toLowerCase() }),
    flag: isoCode,
  };
}

export function serverCell(server: Pick<RankedServer, 'serverId' | 'info'>): Cell {
  // A server whose row is gone has no page.
  return server.info === null
    ? { text: serverLabel(server) }
    : { text: serverLabel(server), href: pathOf('server', { serverId: server.serverId }) };
}

function countriesCrumb(ctx: SiteContext): Cell {
  return { text: ctx.t('navbar.countries'), href: pathOf('countries') };
}

export function countriesModel(ctx: SiteContext, data: CountriesResponse): PageModel {
  const { t } = ctx;
  const { countries } = data;
  const [first, second, third] = countries.map((country) => ctx.country(country.isoCode));
  const withServers = countries.filter((country) => country.onlineServers > 0).length;

  const intro = [t('pages.countries.note', { from: ctx.date(data.from), to: ctx.date(data.to) })];
  if (third) intro.unshift(t('pages.countries.intro', { count: withServers, first, second, third }));

  return {
    title: withSiteName(t('pages.countries.title')),
    description: third
      ? t('pages.countries.description', { count: withServers, first, second, third })
      : t('pages.countries.description-empty'),
    heading: t('pages.countries.heading'),
    intro,
    sections: [{
      table: {
        head: [
          '#',
          t('pages.common.country'),
          t('pages.common.servers-online'),
          t('pages.common.players-online'),
          t('pages.common.average-peak-30d'),
          t('pages.common.change'),
          t('pages.common.share'),
          t('pages.common.record'),
        ],
        rows: countries.map((country) => [
          String(country.rank),
          countryCell(ctx, country.isoCode),
          ctx.number(country.onlineServers),
          ctx.number(country.onlinePlayers),
          ctx.number(country.avgDailyPeak30d, 1),
          changeCell(ctx, country.changePercent30d),
          `${ctx.number(country.sharePercent30d, 1)}%`,
          ctx.number(country.allTimePeak),
        ]),
        numeric: [0, 2, 3, 4, 5, 6, 7],
      },
    }],
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.countries') }],
  };
}

function recentSentence(ctx: SiteContext, standing: CountryStanding, total: number) {
  return ctx.t('pages.country.recent', {
    context: trend(standing.changePercent30d),
    average: ctx.number(standing.avgDailyPeak30d, 1),
    percent: percentOf(ctx, standing.changePercent30d ?? 0),
    share: ctx.number(standing.sharePercent30d, 1),
    rank: standing.rank,
    total,
  });
}

function topServersSection(ctx: SiteContext, servers: RankedServer[]): Section | null {
  const { t } = ctx;
  if (servers.length === 0) return null;
  return {
    heading: t('pages.country.top-servers'),
    table: {
      head: ['#', t('server-list.columns.server'), t('pages.common.players-now'), t('pages.common.average-peak-30d'), t('pages.common.peak-30d')],
      rows: servers.map((server, index) => [
        String(index + 1),
        serverCell(server),
        server.players ?? '—',
        ctx.number(server.avgDailyPeak30d, 1),
        ctx.number(server.peak30d),
      ]),
      numeric: [0, 2, 3, 4],
    },
    note: t('pages.common.average-peak-note'),
  };
}

export function countryModel(ctx: SiteContext, data: CountryDetailResponse): PageModel {
  const { t } = ctx;
  const { standing } = data;
  const country = ctx.country(standing.isoCode);
  const busiest = busiestSlot(data.heatmap?.medians);

  const intro = [
    t('pages.country.now', { count: standing.onlineServers, country, players: ctx.number(standing.onlinePlayers) }),
    recentSentence(ctx, standing, data.totalCountries),
    t('pages.country.record', {
      peak: ctx.number(standing.allTimePeak),
      date: ctx.date(standing.allTimePeakDate),
      country,
      firstSeen: ctx.date(standing.firstSeenDate),
    }),
  ];
  if (busiest) {
    intro.push(t('pages.country.busiest', {
      weekday: ctx.weekday(busiest.weekday),
      hour: String(busiest.hour).padStart(2, '0'),
    }));
  }
  intro.push(t('pages.country.hosting-note'));

  const years: Section = {
    heading: t('pages.country.years'),
    table: {
      head: [t('pages.common.year'), t('pages.common.peak'), t('pages.common.peak-date'), t('pages.common.average-daily-peak')],
      rows: [...data.years].reverse().map((year) => [
        String(year.year),
        ctx.number(year.peak),
        ctx.date(year.peakDate),
        ctx.number(year.avgDailyPeak, 1),
      ]),
      numeric: [1, 3],
    },
  };
  const topServers = topServersSection(ctx, data.topServers);

  return {
    title: withSiteName(t('pages.country.title', { country })),
    description: t('pages.country.description', {
      count: standing.onlineServers,
      country,
      players: ctx.number(standing.onlinePlayers),
      average: ctx.number(standing.avgDailyPeak30d, 1),
      peak: ctx.number(standing.allTimePeak),
      year: standing.firstSeenDate.slice(0, 4),
    }),
    heading: t('pages.country.heading', { country }),
    intro,
    tiles: [
      { label: t('pages.common.servers-online'), value: ctx.number(standing.onlineServers) },
      { label: t('pages.common.players-online'), value: ctx.number(standing.onlinePlayers) },
      {
        label: t('pages.common.average-peak-30d'),
        value: ctx.number(standing.avgDailyPeak30d, 1),
        note: t('pages.common.versus-previous', { change: signedPercent(ctx, standing.changePercent30d) }),
        noteTone: toneOf(standing.changePercent30d),
      },
      {
        label: t('pages.common.share'),
        value: `${ctx.number(standing.sharePercent30d, 1)}%`,
        note: t('pages.country.rank-note', { rank: standing.rank, total: data.totalCountries }),
      },
      { label: t('pages.common.record'), value: ctx.number(standing.allTimePeak), note: ctx.date(standing.allTimePeakDate) },
    ],
    sections: topServers ? [topServers, years] : [years],
    breadcrumbs: [homeCrumb(ctx), countriesCrumb(ctx), { text: country }],
  };
}
