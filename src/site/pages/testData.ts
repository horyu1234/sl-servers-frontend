// Sample API answers for the page model tests. The shapes follow src/types/api.ts.
import i18next from 'i18next';
import { DEFAULT_LANGUAGE, RESOURCES } from '../../i18n/resources';
import { createSiteContext } from '../context';
import type { SiteContext } from '../context';
import type {
  CountriesResponse, CountryDetailResponse, CountryStanding, GlobalHistoryResponse, RankedServer, RankingsResponse,
  ReportResponse, ReportsResponse, ServerInsightsResponse, ServerSummary, VersionDetailResponse, VersionSummary,
  VersionsResponse,
} from '../../types/api';

/** A context that translates like the site does, without the browser's language detection. */
export function testContext(language = DEFAULT_LANGUAGE, urlLanguage: string | null = null): SiteContext {
  const instance = i18next.createInstance();
  instance.init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    resources: RESOURCES,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return createSiteContext(language, (key, values) => instance.t(key, values ?? {}), urlLanguage);
}

export const server: ServerSummary = {
  accountId: 1,
  serverId: 7,
  ip: '203.0.113.7',
  port: 7777,
  online: true,
  version: '14.2.9',
  friendlyFire: true,
  modded: true,
  whitelist: false,
  isoCode: 'KR',
  players: '18/30',
  info: '<span style="color:#ff0000">[KR]</span> Site-19 &amp; Friends<br/>discord.gg/example',
  techList: [{ id: 1, name: 'EXILED', version: '9.13.3' }],
  pastebin: 'abc',
  official: 0,
  distance: 10,
  lastSeen: null,
};

function ranked(serverId: number, name: string, isoCode: string, average: number, previous: number): RankedServer {
  return {
    serverId,
    info: name,
    isoCode,
    online: true,
    players: '10/30',
    avgDailyPeak30d: average,
    avgDailyPeakPrev30d: previous,
    peak30d: Math.round(average) + 5,
    changePercent30d: previous === 0 ? null : Math.round(((average - previous) / previous) * 1000) / 10,
    firstSeenDate: '2023-10-24',
    trackedSinceCollectionStart: false,
  };
}

export const insights: ServerInsightsResponse = {
  serverId: 7,
  generatedAt: '2026-11-10T00:00:00Z',
  history: {
    firstSeenDate: '2023-10-24',
    lastSeenDate: '2026-11-09',
    trackedSinceCollectionStart: false,
    peakPlayers: 107,
    peakDate: '2024-05-15',
    versionCount: 25,
    olderThanOnlinePercent: 85,
  },
  heatmap: {
    weeks: 8,
    // Saturday 12:00 UTC is the busiest hour.
    medians: Array.from({ length: 168 }, (_, slot) => (slot === 5 * 24 + 12 ? 28 : 4)),
    fullRates: null,
    capacity: 30,
  },
  standing: {
    avgDailyPeak30d: 24.5,
    peak30d: 31,
    uptimePercent30d: 99,
    worldRank: 12,
    worldTotal: 1100,
    isoCode: 'KR',
    countryRank: 2,
    countryTotal: 22,
    similar: [{ serverId: 8, info: 'Neighbour <b>server</b>', isoCode: 'KR', online: true, players: '9/30' }],
  },
};

function standing(isoCode: string, rank: number, average: number, change: number | null): CountryStanding {
  return {
    isoCode,
    rank,
    onlineServers: 300 - rank * 30,
    onlinePlayers: 900 - rank * 100,
    avgDailyPeak30d: average,
    peak30d: Math.round(average * 1.2),
    changePercent30d: change,
    sharePercent30d: 40 - rank * 5,
    allTimePeak: Math.round(average * 3),
    allTimePeakDate: '2023-10-29',
    firstSeenDate: '2020-09-30',
  };
}

export const countries: CountriesResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  from: '2026-10-11',
  to: '2026-11-09',
  countries: [
    standing('RU', 1, 1500.5, 4.2),
    standing('CN', 2, 1200, -3.1),
    standing('US', 3, 800, 0),
    standing('KR', 4, 120.4, null),
  ],
};

export const country: CountryDetailResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  standing: countries.countries[3],
  totalCountries: 4,
  years: [
    { year: 2025, peak: 300, peakDate: '2025-01-04', avgDailyPeak: 150.2, days: 365 },
    { year: 2026, peak: 260, peakDate: '2026-02-07', avgDailyPeak: 130.9, days: 313 },
  ],
  heatmap: { weeks: 8, medians: Array.from({ length: 168 }, (_, slot) => (slot === 6 * 24 + 11 ? 140 : 40)), fullRates: null, capacity: null },
  topServers: [ranked(7, '[KR] Site-19', 'KR', 24.5, 20), ranked(8, 'Neighbour', 'KR', 9.1, 12)],
};

export const rankings: RankingsResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  from: '2026-10-11',
  to: '2026-11-09',
  totalRanked: 1100,
  popular: [ranked(99728, 'Dream &lt;Mirror&gt; #1', 'CN', 58.3, 50), ranked(7, '[KR] Site-19', 'KR', 24.5, 20)],
  rising: [ranked(7, '[KR] Site-19', 'KR', 24.5, 20)],
  newcomers: [{ ...ranked(108000, 'Fresh server', 'DE', 6, 0), firstSeenDate: '2026-10-20' }],
  veterans: [{ ...ranked(1333, 'Old guard', 'US', 12, 12), firstSeenDate: '2020-09-17', trackedSinceCollectionStart: true }],
};

function version(name: string, date: string, overrides: Partial<VersionSummary> = {}): VersionSummary {
  return {
    version: name,
    date,
    major: name.endsWith('.0'),
    peakBefore: 5590,
    peakAfter: 4643,
    changePercent: -16.9,
    peakServers: 980,
    peakServersDate: '2026-11-08',
    peakSharePercent: 87.3,
    daysToHalf: 2,
    lastSeenDate: '2026-11-09',
    onlineServers: 972,
    ...overrides,
  };
}

export const versions: VersionsResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  latest: '14.2.9',
  versions: [
    version('14.2.9', '2026-11-01'),
    version('14.2.8', '2026-10-17', { peakBefore: 5115, peakAfter: 5590, changePercent: 9.3, onlineServers: 104, daysToHalf: 0 }),
    version('14.0.0', '2025-02-01', { peakBefore: null, peakAfter: null, changePercent: null, onlineServers: 0, daysToHalf: null, lastSeenDate: '2025-08-01' }),
  ],
};

export const versionDetail: VersionDetailResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  summary: versions.versions[0],
  previous: '14.2.8',
  next: null,
  adoption: [
    { date: '2026-11-01', servers: 210, totalServers: 1130, sharePercent: 18.6 },
    { date: '2026-11-02', servers: 520, totalServers: 1125, sharePercent: 46.2 },
    { date: '2026-11-03', servers: 640, totalServers: 1120, sharePercent: 57.1 },
    { date: '2026-11-05', servers: 800, totalServers: 1122, sharePercent: 71.3 },
  ],
};

export const history: GlobalHistoryResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  daily: [
    { date: '2023-10-28', peak: 9000 },
    { date: '2023-10-29', peak: 11565 },
    { date: '2024-01-06', peak: 9592 },
    { date: '2024-06-01', peak: 9592 },
    { date: '2026-11-09', peak: 3701 },
  ],
  records: [
    { date: '2023-10-29', peak: 11565, version: '13.3.0' },
    { date: '2024-01-06', peak: 9592, version: null },
  ],
  releases: [
    { version: '14.2.8', date: '2026-10-17', major: false, peakBefore: 5115, peakAfter: 5590, changePercent: 9.3 },
    { version: '14.2.9', date: '2026-11-01', major: false, peakBefore: 5590, peakAfter: 4643, changePercent: -16.9 },
    { version: '14.0.0', date: '2025-02-01', major: true, peakBefore: null, peakAfter: null, changePercent: null },
  ],
  gaps: [],
  latest: {
    date: '2026-11-09',
    peak: 3701,
    rank: 1831,
    totalDays: 2194,
    lowerDaysPercent: 16,
    yearAgoDate: '2025-11-10',
    yearAgoPeak: 4697,
    yearAgoChangePercent: -21.2,
  },
  todayPeakSoFar: 2100,
};

export const reports: ReportsResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  months: [
    { period: '2026-10', kind: 'month', from: '2026-10-01', to: '2026-10-31', days: 31, peak: 5590, peakDate: '2026-10-18', avgDailyPeak: 4480.5 },
    { period: '2026-09', kind: 'month', from: '2026-09-01', to: '2026-09-30', days: 30, peak: 5300, peakDate: '2026-09-06', avgDailyPeak: 4300 },
  ],
  years: [
    { period: '2025', kind: 'year', from: '2025-01-01', to: '2025-12-31', days: 365, peak: 8200, peakDate: '2025-01-04', avgDailyPeak: 5100.2 },
  ],
};

export const report: ReportResponse = {
  generatedAt: '2026-11-10T00:00:00Z',
  summary: reports.months[0],
  lowest: { date: '2026-10-07', peak: 3900 },
  previous: { period: '2026-09', avgDailyPeak: 4300, changePercent: 4.2 },
  yearAgo: { period: '2025-10', avgDailyPeak: 5200, changePercent: -13.8 },
  previousPeriod: '2026-09',
  nextPeriod: null,
  activeServers: 1650,
  newServers: 240,
  countries: [
    { isoCode: 'RU', avgDailyPeak: 1500.5, sharePercent: 33.4, changePercent: 4.2 },
    { isoCode: 'CN', avgDailyPeak: 1200, sharePercent: 26.7, changePercent: -3.1 },
    { isoCode: 'US', avgDailyPeak: 800, sharePercent: 17.8, changePercent: null },
  ],
  servers: [
    { serverId: 99728, info: 'Dream &lt;Mirror&gt; #1', isoCode: 'CN', online: true, players: '60/65', avgDailyPeak: 58.3, peak: 65 },
    { serverId: 4, info: null, isoCode: null, online: false, players: null, avgDailyPeak: 40, peak: 48 },
  ],
  releases: [history.releases[0]],
  series: [
    { date: '2026-10-01', peak: 4100, avgDailyPeak: null },
    { date: '2026-10-02', peak: 4300, avgDailyPeak: null },
  ],
};

export const yearReport: ReportResponse = {
  ...report,
  summary: reports.years[0],
  previous: { period: '2024', avgDailyPeak: 6000, changePercent: -15 },
  yearAgo: null,
  previousPeriod: '2024',
  nextPeriod: null,
  releases: [],
  series: [
    { date: '2025-01-01', peak: 8200, avgDailyPeak: 6100.4 },
    { date: '2025-02-01', peak: 7000, avgDailyPeak: 5600 },
  ],
};
