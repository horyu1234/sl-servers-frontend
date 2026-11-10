import type { SiteContext } from '../context';
import { withSiteName } from '../head';
import { busiestSlot, homeCrumb, hourWords } from '../pageModel';
import type { PageModel, Section, Tile } from '../pageModel';
import { plainServerName, truncate } from '../plainText';
import { pathOf } from '../routes';
import type { ServerBrief, ServerInsightsResponse, ServerStanding, ServerSummary } from '../../types/api';

function playersOf(players: string | null | undefined) {
  const [current, capacity] = (players ?? '').split('/').map((part) => Number.parseInt(part, 10));
  return { current: Number.isFinite(current) ? current : 0, capacity: Number.isFinite(capacity) ? capacity : 0 };
}

/** The name to show for a server: its first line, or its number when it has no name. */
export function serverLabel(server: Pick<ServerBrief, 'serverId' | 'info'>) {
  return plainServerName(server.info) || `#${server.serverId}`;
}

export function standingTiles(ctx: SiteContext, standing: ServerStanding): Tile[] {
  const { t } = ctx;
  return [
    {
      label: t('pages.server.tile-average'),
      value: ctx.number(standing.avgDailyPeak30d, 1),
      note: t('pages.server.tile-average-note', { peak: ctx.number(standing.peak30d) }),
    },
    {
      label: t('pages.server.tile-world-rank'),
      value: `#${ctx.number(standing.worldRank)}`,
      note: t('pages.server.tile-rank-note', { total: ctx.number(standing.worldTotal) }),
    },
    {
      label: t('pages.server.tile-country-rank', { country: ctx.country(standing.isoCode) }),
      value: `#${ctx.number(standing.countryRank)}`,
      note: t('pages.server.tile-rank-note', { total: ctx.number(standing.countryTotal) }),
    },
    {
      label: t('pages.server.tile-uptime'),
      value: `${standing.uptimePercent30d}%`,
      note: t('pages.server.tile-uptime-note'),
    },
  ];
}

/** The sentences that describe a server, built from what the API knows about it. */
export function serverSentences(ctx: SiteContext, server: ServerSummary, insights: ServerInsightsResponse | null) {
  const { t } = ctx;
  const name = serverLabel(server);
  const country = ctx.country(server.isoCode);
  const sentences: string[] = [];

  sentences.push([
    t('pages.server.about', { context: server.modded ? 'modded' : 'vanilla', name, country, version: server.version }),
    t('pages.server.friendly-fire', { context: server.friendlyFire ? 'on' : 'off' }),
    server.whitelist ? t('pages.server.whitelist') : '',
  ].filter(Boolean).join(' '));

  const history = insights?.history;
  if (history) {
    sentences.push([
      history.trackedSinceCollectionStart
        ? t('pages.server.listed-since-start')
        : t('pages.server.listed-since', { date: ctx.date(history.firstSeenDate) }),
      t('pages.server.record', { players: ctx.number(history.peakPlayers), date: ctx.date(history.peakDate) }),
    ].join(' '));
  }

  const standing = insights?.standing;
  if (standing) {
    sentences.push(t('pages.server.standing', {
      average: ctx.number(standing.avgDailyPeak30d, 1),
      worldRank: ctx.number(standing.worldRank),
      worldTotal: ctx.number(standing.worldTotal),
      countryRank: ctx.number(standing.countryRank),
      countryTotal: ctx.number(standing.countryTotal),
      country,
      uptime: standing.uptimePercent30d,
    }));
  }

  const busiest = busiestSlot(insights?.heatmap?.medians);
  if (busiest) {
    sentences.push(t('pages.server.busiest', { ...hourWords(ctx, busiest), players: ctx.number(busiest.players) }));
  }

  if (!server.online) {
    sentences.push(server.lastSeen
      ? t('pages.server.offline-since', { date: ctx.date(server.lastSeen.slice(0, 10)) })
      : t('pages.server.offline'));
  }

  return sentences;
}

export function similarServers(ctx: SiteContext, standing: ServerStanding | null | undefined): Section | null {
  if (!standing || standing.similar.length === 0) return null;
  return {
    heading: ctx.t('pages.server.similar', { country: ctx.country(standing.isoCode) }),
    links: standing.similar.map((server) => ({
      text: serverLabel(server),
      href: pathOf('server', { serverId: server.serverId }),
    })),
  };
}

export function serverModel(ctx: SiteContext, server: ServerSummary, insights: ServerInsightsResponse | null): PageModel {
  const { t } = ctx;
  const name = serverLabel(server);
  const country = ctx.country(server.isoCode);
  const { current, capacity } = playersOf(server.players);
  const yes = t('server-list.tech.yes');
  const no = t('server-list.tech.no');

  const details: Section = {
    heading: t('server-info.title'),
    table: {
      head: [],
      rows: [
        [t('pages.common.country'), { text: country, href: pathOf('country', { isoCode: server.isoCode.toLowerCase() }) }],
        [t('server-info.players'), `${current} / ${capacity}`],
        [t('server-list.tech.game-version'), server.version],
        [t('server-list.tech.friendly-fire'), server.friendlyFire ? yes : no],
        [t('server-list.tech.whitelist'), server.whitelist ? yes : no],
        [t('filter-option.yes-no-filter.modded'), server.modded ? yes : no],
        ...(server.ip === null ? [] : [[t('server-list.columns.address'), `${server.ip}:${server.port}`]]),
        ...server.techList.map((tech) => [tech.name, tech.version]),
      ],
    },
  };
  const similar = similarServers(ctx, insights?.standing);

  return {
    title: withSiteName(truncate(name, 70)),
    description: t('pages.server.description', {
      context: server.online ? 'online' : 'offline',
      name: truncate(name, 60),
      country,
      players: current,
      capacity,
      version: server.version,
    }),
    heading: name,
    intro: serverSentences(ctx, server, insights),
    tiles: insights?.standing ? standingTiles(ctx, insights.standing) : undefined,
    sections: similar ? [details, similar] : [details],
    breadcrumbs: [
      homeCrumb(ctx),
      { text: country, href: pathOf('country', { isoCode: server.isoCode.toLowerCase() }) },
      { text: name },
    ],
    // The API hides the address of a server that has been offline for over 30 days. Such a page
    // only holds history, and there are over twenty thousand of them.
    noindex: !server.online && server.ip === null,
  };
}
