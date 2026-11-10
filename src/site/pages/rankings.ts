import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { homeCrumb, signedPercent } from '../pageModel';
import type { CellValue, PageModel, Section } from '../pageModel';
import { countryCell, serverCell } from './countries';
import { serverLabel } from './server';
import type { RankedServer, RankingsResponse } from '../../types/api';

function country(ctx: SiteContext, server: RankedServer): CellValue {
  return server.isoCode ? countryCell(ctx, server.isoCode) : '—';
}

function firstSeen(ctx: SiteContext, server: RankedServer) {
  if (server.trackedSinceCollectionStart) return ctx.t('pages.rankings.before-records');
  return server.firstSeenDate ? ctx.date(server.firstSeenDate) : '—';
}

function board(ctx: SiteContext, key: string, servers: RankedServer[], head: string[], columns: (server: RankedServer) => CellValue[], numeric: number[]): Section {
  return {
    heading: ctx.t(`pages.rankings.${key}`),
    paragraphs: [ctx.t(`pages.rankings.${key}-note`)],
    table: {
      head: ['#', ctx.t('server-list.columns.server'), ctx.t('pages.common.country'), ...head],
      rows: servers.map((server, index) => [String(index + 1), serverCell(server), country(ctx, server), ...columns(server)]),
      numeric: [0, ...numeric],
    },
  };
}

export function rankingsModel(ctx: SiteContext, data: RankingsResponse): PageModel {
  const { t } = ctx;
  const leader = data.popular[0];
  const intro = [t('pages.rankings.intro', {
    total: ctx.number(data.totalRanked),
    from: ctx.date(data.from),
    to: ctx.date(data.to),
  })];
  if (leader) {
    intro.push(t('pages.rankings.leader', { name: serverLabel(leader), average: ctx.number(leader.avgDailyPeak30d, 1) }));
  }

  const sections = [
    board(ctx, 'popular', data.popular,
      [t('pages.common.players-now'), t('pages.common.average-peak-30d'), t('pages.common.peak-30d')],
      (server) => [server.players ?? '—', ctx.number(server.avgDailyPeak30d, 1), ctx.number(server.peak30d)],
      [3, 4, 5]),
    board(ctx, 'rising', data.rising,
      [t('pages.common.average-peak-30d'), t('pages.rankings.previous-30d'), t('pages.common.change')],
      (server) => [
        ctx.number(server.avgDailyPeak30d, 1),
        ctx.number(server.avgDailyPeakPrev30d, 1),
        signedPercent(ctx, server.changePercent30d),
      ],
      [3, 4, 5]),
    board(ctx, 'newcomers', data.newcomers,
      [t('pages.rankings.first-seen'), t('pages.common.average-peak-30d'), t('pages.common.peak-30d')],
      (server) => [firstSeen(ctx, server), ctx.number(server.avgDailyPeak30d, 1), ctx.number(server.peak30d)],
      [4, 5]),
    board(ctx, 'veterans', data.veterans,
      [t('pages.rankings.first-seen'), t('pages.common.average-peak-30d')],
      (server) => [firstSeen(ctx, server), ctx.number(server.avgDailyPeak30d, 1)],
      [4]),
  ].filter((section) => section.table && section.table.rows.length > 0);

  return {
    title: withSiteName(t('pages.rankings.title')),
    description: t('pages.rankings.description', { total: ctx.number(data.totalRanked) }),
    heading: t('pages.rankings.heading'),
    intro,
    sections,
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.rankings') }],
  };
}
