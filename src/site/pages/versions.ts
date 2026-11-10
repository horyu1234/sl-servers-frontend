import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { homeCrumb, percentOf, signedPercent, trend } from '../pageModel';
import type { Cell, PageModel, Section } from '../pageModel';
import { pathOf } from '../routes';
import type { VersionAdoptionDay, VersionDetailResponse, VersionSummary, VersionsResponse } from '../../types/api';

const DAY_MS = 86_400_000;
// Days after release shown in the adoption table. The chart shows every day.
const ADOPTION_DAYS = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60];

function versionCell(version: string): Cell {
  return { text: version, href: pathOf('version', { version }) };
}

function versionsCrumb(ctx: SiteContext): Cell {
  return { text: ctx.t('navbar.versions'), href: pathOf('versions') };
}

function daysToHalf(ctx: SiteContext, days: number | null) {
  if (days === null) return '—';
  return days === 0 ? ctx.t('pages.versions.same-day') : ctx.t('pages.versions.days', { count: days });
}

export function versionsModel(ctx: SiteContext, data: VersionsResponse): PageModel {
  const { t } = ctx;
  const latest = data.versions.find((version) => version.version === data.latest) ?? data.versions[0];

  return {
    title: withSiteName(t('pages.versions.title')),
    description: latest
      ? t('pages.versions.description', { count: data.versions.length, latest: latest.version })
      : t('pages.versions.description-empty'),
    heading: t('pages.versions.heading'),
    intro: [
      ...(latest
        ? [t('pages.versions.intro', { count: data.versions.length, latest: latest.version, date: ctx.date(latest.date) })]
        : []),
      t('pages.versions.note'),
    ],
    sections: [{
      table: {
        head: [
          t('insights.global.release-version'),
          t('insights.global.release-date'),
          t('pages.versions.kind'),
          t('insights.global.release-before'),
          t('insights.global.release-after'),
          t('pages.common.change'),
          t('pages.versions.half'),
          t('pages.versions.servers-now'),
        ],
        rows: data.versions.map((version) => [
          versionCell(version.version),
          ctx.date(version.date),
          t('pages.versions.kind', { context: version.major ? 'major' : 'minor' }),
          version.peakBefore === null ? '—' : ctx.number(version.peakBefore),
          version.peakAfter === null ? '—' : ctx.number(version.peakAfter),
          signedPercent(ctx, version.changePercent),
          daysToHalf(ctx, version.daysToHalf),
          ctx.number(version.onlineServers),
        ]),
        numeric: [3, 4, 5, 6, 7],
      },
      note: t('insights.global.release-caveat'),
    }],
    breadcrumbs: [homeCrumb(ctx), { text: t('navbar.versions') }],
  };
}

function daysSince(date: string, start: string) {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS);
}

function adoptionSection(ctx: SiteContext, summary: VersionSummary, adoption: VersionAdoptionDay[]): Section | null {
  const { t } = ctx;
  const rows = adoption.filter((day) => ADOPTION_DAYS.includes(daysSince(day.date, summary.date)));
  if (rows.length === 0) return null;
  return {
    heading: t('pages.version.adoption'),
    paragraphs: [t('pages.version.adoption-note')],
    table: {
      head: [t('pages.version.day'), t('pages.common.date'), t('pages.version.servers-on'), t('pages.version.servers-active'), t('pages.common.share')],
      rows: rows.map((day) => [
        String(daysSince(day.date, summary.date)),
        ctx.date(day.date),
        ctx.number(day.servers),
        ctx.number(day.totalServers),
        `${ctx.number(day.sharePercent, 1)}%`,
      ]),
      numeric: [0, 2, 3, 4],
    },
  };
}

export function versionModel(ctx: SiteContext, data: VersionDetailResponse): PageModel {
  const { t } = ctx;
  const { summary } = data;
  const { version } = summary;
  const hasImpact = summary.peakBefore !== null && summary.peakAfter !== null && summary.changePercent !== null;

  const intro = [t('pages.version.first-seen', {
    context: summary.major ? 'major' : 'minor',
    version,
    date: ctx.date(summary.date),
  })];
  if (hasImpact) {
    intro.push(t('pages.version.impact', {
      context: trend(summary.changePercent),
      before: ctx.number(summary.peakBefore ?? 0),
      after: ctx.number(summary.peakAfter ?? 0),
      percent: percentOf(ctx, summary.changePercent ?? 0),
    }));
  }
  intro.push([
    summary.daysToHalf === null
      ? t('pages.version.half-never')
      : summary.daysToHalf === 0
        ? t('pages.version.half-first-day')
        : t('pages.version.half', { count: summary.daysToHalf }),
    t('pages.version.height', {
      date: ctx.date(summary.peakServersDate),
      servers: ctx.number(summary.peakServers),
      share: ctx.number(summary.peakSharePercent, 1),
    }),
  ].join(' '));
  intro.push(summary.onlineServers > 0
    ? t('pages.version.now', { count: summary.onlineServers, version })
    : t('pages.version.gone', { date: ctx.date(summary.lastSeenDate) }));

  const neighbours: Cell[] = [];
  if (data.previous) neighbours.push({ text: t('pages.version.previous', { version: data.previous }), href: pathOf('version', { version: data.previous }) });
  if (data.next) neighbours.push({ text: t('pages.version.next', { version: data.next }), href: pathOf('version', { version: data.next }) });

  const adoption = adoptionSection(ctx, summary, data.adoption);
  const sections: Section[] = [];
  if (adoption) sections.push(adoption);
  if (neighbours.length > 0) sections.push({ heading: t('pages.version.neighbours'), links: neighbours });

  return {
    title: withSiteName(t('pages.version.title', { version })),
    description: t('pages.version.description', {
      context: hasImpact ? 'impact' : 'plain',
      version,
      date: ctx.date(summary.date),
      before: ctx.number(summary.peakBefore ?? 0),
      after: ctx.number(summary.peakAfter ?? 0),
      change: signedPercent(ctx, summary.changePercent),
    }),
    heading: t('pages.version.heading', { version }),
    intro,
    tiles: [
      { label: t('insights.global.release-date'), value: ctx.date(summary.date), note: t('pages.versions.kind', { context: summary.major ? 'major' : 'minor' }) },
      {
        label: t('pages.version.tile-change'),
        value: signedPercent(ctx, summary.changePercent),
        note: hasImpact
          ? t('pages.version.tile-change-note', { before: ctx.number(summary.peakBefore ?? 0), after: ctx.number(summary.peakAfter ?? 0) })
          : undefined,
      },
      { label: t('pages.versions.half'), value: daysToHalf(ctx, summary.daysToHalf) },
      {
        label: t('pages.version.tile-peak-servers'),
        value: ctx.number(summary.peakServers),
        note: t('pages.version.tile-peak-servers-note', { share: ctx.number(summary.peakSharePercent, 1) }),
      },
    ],
    sections,
    breadcrumbs: [homeCrumb(ctx), versionsCrumb(ctx), { text: version }],
  };
}
