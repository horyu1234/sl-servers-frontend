import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { changeCell, dayWords, homeCrumb, percentOf, signedPercent, toneOf, trend } from '../pageModel';
import type { Cell, PageModel, Section } from '../pageModel';
import { pathOf } from '../routes';
import { countryCell, serverCell } from './countries';
import type { ReportPeriodSummary, ReportResponse, ReportsResponse } from '../../types/api';

// A year sees a dozen releases. Past this many, the text counts them and the table lists them.
const MAX_RELEASE_SENTENCES = 2;

/** "October 2026" for a month and "2025" for a year. */
export function periodLabel(ctx: SiteContext, period: string) {
  return period.length === 4 ? ctx.t('pages.report.year-label', { year: period }) : ctx.month(period);
}

function reportCell(ctx: SiteContext, period: string): Cell {
  return { text: periodLabel(ctx, period), href: pathOf('report', { period }) };
}

function reportsCrumb(ctx: SiteContext): Cell {
  return { text: ctx.t('navbar.reports'), href: pathOf('reports') };
}

function periodTable(ctx: SiteContext, heading: string, periods: ReportPeriodSummary[]): Section {
  const { t } = ctx;
  return {
    heading,
    table: {
      head: [t('pages.reports.period'), t('pages.common.peak'), t('pages.common.peak-date'), t('pages.common.average-daily-peak')],
      rows: periods.map((period) => [
        reportCell(ctx, period.period),
        ctx.number(period.peak),
        ctx.date(period.peakDate),
        ctx.number(period.avgDailyPeak, 1),
      ]),
      numeric: [1, 3],
    },
  };
}

export function reportsModel(ctx: SiteContext, data: ReportsResponse): PageModel {
  const { t } = ctx;
  const latest = data.months[0];
  const sections: Section[] = [];
  if (data.years.length > 0) sections.push(periodTable(ctx, t('pages.reports.years'), data.years));
  if (data.months.length > 0) sections.push(periodTable(ctx, t('pages.reports.months'), data.months));

  return {
    title: withSiteName(t('pages.reports.title')),
    description: latest
      ? t('pages.reports.description', { latest: periodLabel(ctx, latest.period) })
      : t('pages.reports.description-empty'),
    heading: t('pages.reports.heading'),
    intro: [t('pages.reports.intro', dayWords(ctx))],
    sections,
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.reports') }],
  };
}

export function reportModel(ctx: SiteContext, data: ReportResponse): PageModel {
  const { t } = ctx;
  const { summary } = data;
  const period = periodLabel(ctx, summary.period);
  const isYear = summary.kind === 'year';

  const intro = [t('pages.report.players', {
    period,
    peak: ctx.number(summary.peak),
    date: ctx.date(summary.peakDate),
    average: ctx.number(summary.avgDailyPeak, 1),
    low: ctx.number(data.lowest.peak),
    lowDate: ctx.date(data.lowest.date),
  })];

  const comparisons: string[] = [];
  if (data.previous && data.previous.changePercent !== null) {
    comparisons.push(t('pages.report.versus-previous', {
      context: trend(data.previous.changePercent),
      percent: percentOf(ctx, data.previous.changePercent),
      previous: periodLabel(ctx, data.previous.period),
    }));
  }
  if (data.yearAgo && data.yearAgo.changePercent !== null) {
    comparisons.push(t('pages.report.versus-year-ago', {
      context: trend(data.yearAgo.changePercent),
      percent: percentOf(ctx, data.yearAgo.changePercent),
      yearAgo: periodLabel(ctx, data.yearAgo.period),
    }));
  }
  if (comparisons.length > 0) intro.push(comparisons.join(' '));

  intro.push(t('pages.report.servers', { active: ctx.number(data.activeServers), fresh: ctx.number(data.newServers) }));

  const [first, second, third] = data.countries;
  if (first && second && third) {
    intro.push(t('pages.report.countries', {
      first: ctx.country(first.isoCode),
      share: ctx.number(first.sharePercent, 1),
      second: ctx.country(second.isoCode),
      third: ctx.country(third.isoCode),
    }));
  }
  if (data.releases.length > MAX_RELEASE_SENTENCES) {
    intro.push(t('pages.report.release-many', {
      count: data.releases.length,
      first: data.releases[0].version,
      last: data.releases[data.releases.length - 1].version,
    }));
  } else if (data.releases.length > 0) {
    intro.push(data.releases
      .map((release) => t('pages.report.release', { version: release.version, date: ctx.date(release.date) }))
      .join(' '));
  }

  const sections: Section[] = [];
  if (data.countries.length > 0) {
    sections.push({
      heading: t('pages.report.top-countries'),
      table: {
        head: ['#', t('pages.common.country'), t('pages.common.average-daily-peak'), t('pages.common.share'), t('pages.common.change')],
        rows: data.countries.map((country, index) => [
          String(index + 1),
          countryCell(ctx, country.isoCode),
          ctx.number(country.avgDailyPeak, 1),
          `${ctx.number(country.sharePercent, 1)}%`,
          changeCell(ctx, country.changePercent),
        ]),
        numeric: [0, 2, 3, 4],
      },
      note: t('pages.country.hosting-note'),
    });
  }
  if (data.servers.length > 0) {
    sections.push({
      heading: t('pages.report.top-servers'),
      table: {
        head: ['#', t('server-list.columns.server'), t('pages.common.country'), t('pages.common.average-daily-peak'), t('pages.common.peak')],
        rows: data.servers.map((server, index) => [
          String(index + 1),
          serverCell(server),
          server.isoCode ? countryCell(ctx, server.isoCode) : '—',
          ctx.number(server.avgDailyPeak, 1),
          ctx.number(server.peak),
        ]),
        numeric: [0, 3, 4],
      },
      note: t('pages.report.top-servers-note'),
    });
  }
  if (data.releases.length > 0) {
    sections.push({
      heading: t('pages.report.releases'),
      table: {
        head: [
          t('insights.global.release-version'),
          t('insights.global.release-date'),
          t('insights.global.release-before'),
          t('insights.global.release-after'),
          t('pages.common.change'),
        ],
        rows: data.releases.map((release) => [
          { text: release.version, href: pathOf('version', { version: release.version }) },
          ctx.date(release.date),
          release.peakBefore === null ? '—' : ctx.number(release.peakBefore),
          release.peakAfter === null ? '—' : ctx.number(release.peakAfter),
          changeCell(ctx, release.changePercent),
        ]),
        numeric: [2, 3, 4],
      },
      note: t('insights.global.release-caveat'),
    });
  }
  if (data.series.length > 0) {
    sections.push({
      heading: isYear ? t('pages.report.by-month') : t('pages.report.by-day'),
      table: isYear
        ? {
          head: [t('pages.reports.period'), t('pages.common.peak'), t('pages.common.average-daily-peak')],
          rows: data.series.map((point) => [
            reportCell(ctx, point.date.slice(0, 7)),
            ctx.number(point.peak),
            point.avgDailyPeak === null ? '—' : ctx.number(point.avgDailyPeak, 1),
          ]),
          numeric: [1, 2],
        }
        : {
          head: [t('pages.common.date'), t('pages.common.peak')],
          rows: data.series.map((point) => [ctx.date(point.date), ctx.number(point.peak)]),
          numeric: [1],
        },
    });
  }

  const neighbours: Cell[] = [];
  if (data.previousPeriod) neighbours.push(reportCell(ctx, data.previousPeriod));
  if (data.nextPeriod) neighbours.push(reportCell(ctx, data.nextPeriod));
  if (neighbours.length > 0) sections.push({ heading: t('pages.report.neighbours'), links: neighbours });

  return {
    title: withSiteName(t('pages.report.title', { period })),
    description: t('pages.report.description', {
      period,
      peak: ctx.number(summary.peak),
      average: ctx.number(summary.avgDailyPeak, 1),
    }),
    heading: t('pages.report.heading', { period }),
    intro,
    tiles: [
      { label: t('pages.report.tile-peak'), value: ctx.number(summary.peak), note: ctx.date(summary.peakDate) },
      {
        label: t('pages.common.average-daily-peak'),
        value: ctx.number(summary.avgDailyPeak, 1),
        note: data.previous
          ? t('pages.report.tile-versus', { change: signedPercent(ctx, data.previous.changePercent), previous: periodLabel(ctx, data.previous.period) })
          : undefined,
        noteTone: toneOf(data.previous?.changePercent),
      },
      {
        label: t('pages.report.tile-servers'),
        value: ctx.number(data.activeServers),
        note: t('pages.report.tile-servers-note', { fresh: ctx.number(data.newServers) }),
      },
      ...(first
        ? [{
          label: t('pages.report.tile-country'),
          value: ctx.country(first.isoCode),
          note: `${ctx.number(first.sharePercent, 1)}%`,
        }]
        : []),
    ],
    sections,
    breadcrumbs: [homeCrumb(ctx), reportsCrumb(ctx), { text: period }],
  };
}
