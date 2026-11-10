import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { homeCrumb, signedPercent } from '../pageModel';
import type { PageModel, Section } from '../pageModel';
import { pathOf } from '../routes';
import { countryCell } from './countries';
import type { CountriesResponse, DailyPlayerPeak, GlobalHistoryResponse } from '../../types/api';

const COUNTRY_RECORDS = 15;
const RELEASE_JUMPS = 5;

export interface YearRecord {
  year: number;
  peak: number;
  peakDate: string;
  averageDailyPeak: number;
  days: number;
}

/** The busiest day, the mean daily peak and the number of recorded days of each calendar year. */
export function yearlyRecords(daily: DailyPlayerPeak[]): YearRecord[] {
  const years = new Map<number, { peak: number; peakDate: string; total: number; days: number }>();
  for (const day of daily) {
    const year = Number(day.date.slice(0, 4));
    const entry = years.get(year);
    if (!entry) {
      years.set(year, { peak: day.peak, peakDate: day.date, total: day.peak, days: 1 });
      continue;
    }
    entry.total += day.peak;
    entry.days += 1;
    // The earliest day keeps a tie, so a record stays put once it is set.
    if (day.peak > entry.peak) {
      entry.peak = day.peak;
      entry.peakDate = day.date;
    }
  }
  return Array.from(years.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, entry]) => ({
      year,
      peak: entry.peak,
      peakDate: entry.peakDate,
      averageDailyPeak: entry.total / entry.days,
      days: entry.days,
    }));
}

export function recordsModel(ctx: SiteContext, history: GlobalHistoryResponse, countries: CountriesResponse | null): PageModel {
  const { t } = ctx;
  const top = history.records[0];
  const first = history.daily[0];

  const intro: string[] = [];
  if (top) {
    intro.push(t('pages.records.top', {
      context: top.version ? 'release' : 'plain',
      peak: ctx.number(top.peak),
      date: ctx.date(top.date),
      version: top.version,
    }));
  }
  if (first) intro.push(t('pages.records.scope', { start: ctx.date(first.date) }));
  if (history.latest) {
    intro.push(t('pages.records.latest', {
      date: ctx.date(history.latest.date),
      peak: ctx.number(history.latest.peak),
      rank: ctx.number(history.latest.rank),
      days: ctx.number(history.latest.totalDays),
    }));
  }

  const sections: Section[] = [];
  if (history.records.length > 0) {
    sections.push({
      heading: t('insights.global.records'),
      paragraphs: [t('pages.records.days-note')],
      table: {
        head: ['#', t('pages.common.date'), t('pages.common.peak'), t('pages.records.near-update')],
        rows: history.records.map((record, index) => [
          String(index + 1),
          ctx.date(record.date),
          ctx.number(record.peak),
          record.version ? { text: record.version, href: pathOf('version', { version: record.version }) } : '—',
        ]),
        numeric: [0, 2],
      },
    });
  }

  const years = yearlyRecords(history.daily);
  if (years.length > 0) {
    sections.push({
      heading: t('pages.records.years'),
      table: {
        head: [t('pages.common.year'), t('pages.common.peak'), t('pages.common.peak-date'), t('pages.common.average-daily-peak'), t('pages.records.days-recorded')],
        rows: years.map((year) => [
          String(year.year),
          ctx.number(year.peak),
          ctx.date(year.peakDate),
          ctx.number(year.averageDailyPeak, 1),
          ctx.number(year.days),
        ]),
        numeric: [1, 3, 4],
      },
    });
  }

  const jumps = history.releases
    .filter((release) => release.changePercent !== null)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0))
    .slice(0, RELEASE_JUMPS);
  if (jumps.length > 0) {
    sections.push({
      heading: t('pages.records.jumps'),
      table: {
        head: [
          t('insights.global.release-version'),
          t('insights.global.release-date'),
          t('insights.global.release-before'),
          t('insights.global.release-after'),
          t('pages.common.change'),
        ],
        rows: jumps.map((release) => [
          { text: release.version, href: pathOf('version', { version: release.version }) },
          ctx.date(release.date),
          release.peakBefore === null ? '—' : ctx.number(release.peakBefore),
          release.peakAfter === null ? '—' : ctx.number(release.peakAfter),
          signedPercent(ctx, release.changePercent),
        ]),
        numeric: [2, 3, 4],
      },
      note: t('insights.global.release-caveat'),
    });
  }

  const countryRecords = [...(countries?.countries ?? [])]
    .sort((a, b) => b.allTimePeak - a.allTimePeak)
    .slice(0, COUNTRY_RECORDS);
  if (countryRecords.length > 0) {
    sections.push({
      heading: t('pages.records.countries'),
      table: {
        head: ['#', t('pages.common.country'), t('pages.common.record'), t('pages.common.date')],
        rows: countryRecords.map((country, index) => [
          String(index + 1),
          countryCell(ctx, country.isoCode),
          ctx.number(country.allTimePeak),
          ctx.date(country.allTimePeakDate),
        ]),
        numeric: [0, 2],
      },
      note: t('pages.country.hosting-note'),
    });
  }

  return {
    title: withSiteName(t('pages.records.title')),
    description: top
      ? t('pages.records.description', { peak: ctx.number(top.peak), date: ctx.date(top.date) })
      : t('pages.records.description-empty'),
    heading: t('pages.records.heading'),
    intro,
    sections,
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.all-stats'), href: pathOf('stats') }, { text: t('navbar.records') }],
  };
}
