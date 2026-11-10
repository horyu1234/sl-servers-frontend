// JSON shapes of sl-servers-api. Each type names the Kotlin class it mirrors, in
// me.horyu.slservers.api.domain unless noted. Change them together with the API.
//
// Kotlin Long, Int, Float and Double all arrive as number. Instant and LocalDate
// arrive as ISO strings. The API keeps Jackson's defaults, so a Kotlin nullable
// field is present with the value null, never left out.

/** Instant, e.g. 2026-11-08T00:00:00Z */
export type IsoInstant = string;
/** LocalDate, e.g. 2026-11-08 */
export type IsoDate = string;

/** me.horyu.slservers.common.ServerTech */
export interface ServerTech {
  id: number | null;
  name: string;
  version: string;
}

/** ServerSummary. continentCode is @JsonIgnore, so it is not part of the response. */
export interface ServerSummary {
  accountId: number;
  serverId: number;
  /** null when the server has been offline for more than 30 days. */
  ip: string | null;
  port: number;
  online: boolean;
  version: string;
  friendlyFire: boolean;
  modded: boolean;
  whitelist: boolean;
  isoCode: string;
  players: string;
  info: string;
  techList: ServerTech[];
  pastebin: string;
  official: number;
  distance: number | null;
  /**
   * When an offline server was last online. null for an online server or when there is no
   * record. Optional only because API builds before this field leave it out.
   */
  lastSeen?: IsoInstant | null;
}

/** ServerSummaryResponse */
export interface ServerSummaryResponse {
  onlineUserCount: number;
  onlineServerCount: number;
  displayUserCount: number;
  displayServerCount: number;
  offlineServerCount: number;
  servers: ServerSummary[];
}

/** ServerSortType */
export type ServerSortType =
  | 'PLAYERS_DESC'
  | 'PLAYERS_ASC'
  | 'DISTANCE_ASC'
  | 'DISTANCE_DESC'
  | 'INGAME_ORDER';

/**
 * The string form this site sends for a Kotlin Boolean?. Jackson reads 'null' as
 * null, so the list filter can keep one type for its radio values and the URL.
 */
export type TriState = 'null' | 'true' | 'false';

/** ServerSortOption, the body of POST /api/servers. */
export interface ServerSortOption {
  search: string;
  countryFilter: string[];
  hideEmptyServer: boolean;
  hideFullServer: boolean;
  friendlyFire: TriState;
  whitelist: TriState;
  modded: TriState;
  sort: ServerSortType;
  /**
   * Inclusive bounds on the current player count and on the slot count (maximum players).
   * null or absent leaves that end open. A negative bound or a minimum above its maximum answers 400.
   */
  minPlayers?: number | null;
  maxPlayers?: number | null;
  minSlots?: number | null;
  maxSlots?: number | null;
}

/** FluxTrendParams, the query of the /graph endpoints. */
export interface FluxTrendParams {
  startTime: string;
  stopTime?: string;
  aggregateEvery: string;
}

/** Vector2 */
export interface Vector2 {
  lat: number;
  long: number;
}

/** me.horyu.slservers.api.map.ServerLoc */
export interface ServerLoc {
  serverId: number;
  info: string;
  location: Vector2;
}

/** ServerTrendsWindow.fromParam */
export type ServerTrendsWindow = '6h' | '24h' | '7d';

/** ServerTrendsResolution.fromParam */
export type ServerTrendsResolution = '15m' | '1h' | '6h';

/** ServerTrendsResponse */
export interface ServerTrendsResponse {
  window: string;
  resolution: string;
  bucketCount: number;
  endTime: IsoInstant;
  serverIds: string[];
  trends: Record<string, (number | null)[]>;
}

/** ServerHistory */
export interface ServerHistory {
  firstSeenDate: IsoDate;
  lastSeenDate: IsoDate;
  trackedSinceCollectionStart: boolean;
  peakPlayers: number;
  peakDate: IsoDate;
  versionCount: number;
  olderThanOnlinePercent: number | null;
}

/** ServerActivityHeatmap */
export interface ServerActivityHeatmap {
  weeks: number;
  medians: (number | null)[];
  fullRates: (number | null)[] | null;
  capacity: number | null;
}

/** ServerBrief. A server as rankings and lists of related servers show it. */
export interface ServerBrief {
  serverId: number;
  /** null when the server row is gone. */
  info: string | null;
  isoCode: string | null;
  online: boolean;
  /** "12/30", or null when the server row is gone. */
  players: string | null;
}

/** ServerStanding. The windows are the last 30 complete UTC days and the 30 before them. */
export interface ServerStanding {
  avgDailyPeak30d: number;
  peak30d: number;
  uptimePercent30d: number;
  worldRank: number;
  worldTotal: number;
  isoCode: string;
  countryRank: number;
  countryTotal: number;
  similar: ServerBrief[];
}

/** ServerInsightsResponse */
export interface ServerInsightsResponse {
  serverId: number;
  generatedAt: IsoInstant;
  history: ServerHistory | null;
  heatmap: ServerActivityHeatmap | null;
  /**
   * null for an offline server or one without a sample in the last 30 days.
   * Optional only because API builds before this field leave it out.
   */
  standing?: ServerStanding | null;
}

/** DailyPlayerPeak */
export interface DailyPlayerPeak {
  date: IsoDate;
  peak: number;
}

/** ReleaseImpact */
export interface ReleaseImpact {
  version: string;
  date: IsoDate;
  major: boolean;
  peakBefore: number | null;
  peakAfter: number | null;
  changePercent: number | null;
}

/** HistoricPeak */
export interface HistoricPeak {
  date: IsoDate;
  peak: number;
  version: string | null;
}

/** CollectionGap */
export interface CollectionGap {
  from: IsoDate;
  to: IsoDate;
  days: number;
}

/** DayStanding */
export interface DayStanding {
  date: IsoDate;
  peak: number;
  rank: number;
  totalDays: number;
  lowerDaysPercent: number;
  yearAgoDate: IsoDate | null;
  yearAgoPeak: number | null;
  yearAgoChangePercent: number | null;
}

/** GlobalHistoryResponse */
export interface GlobalHistoryResponse {
  generatedAt: IsoInstant;
  daily: DailyPlayerPeak[];
  records: HistoricPeak[];
  releases: ReleaseImpact[];
  gaps: CollectionGap[];
  latest: DayStanding | null;
  todayPeakSoFar: number | null;
}

/** StatsAPI.modLoaderGraph: Map<String, Map<String, Int>>, loader name to version to count. */
export type ModLoaderCounts = Record<string, Record<string, number>>;

/** RankedServer */
export interface RankedServer extends ServerBrief {
  avgDailyPeak30d: number;
  avgDailyPeakPrev30d: number;
  peak30d: number;
  changePercent30d: number | null;
  firstSeenDate: IsoDate | null;
  trackedSinceCollectionStart: boolean;
}

/** CountryStanding. A server belongs to the country it is hosted in. */
export interface CountryStanding {
  isoCode: string;
  rank: number;
  onlineServers: number;
  onlinePlayers: number;
  avgDailyPeak30d: number;
  peak30d: number;
  changePercent30d: number | null;
  sharePercent30d: number;
  allTimePeak: number;
  allTimePeakDate: IsoDate;
  firstSeenDate: IsoDate;
}

/** CountriesResponse */
export interface CountriesResponse {
  generatedAt: IsoInstant;
  from: IsoDate;
  to: IsoDate;
  countries: CountryStanding[];
}

/** CountryYear */
export interface CountryYear {
  year: number;
  peak: number;
  peakDate: IsoDate;
  avgDailyPeak: number;
  days: number;
}

/** CountryDetailResponse */
export interface CountryDetailResponse {
  generatedAt: IsoInstant;
  standing: CountryStanding;
  totalCountries: number;
  years: CountryYear[];
  heatmap: ServerActivityHeatmap | null;
  topServers: RankedServer[];
}

/** RankingsResponse. Only servers that are online are ranked. */
export interface RankingsResponse {
  generatedAt: IsoInstant;
  from: IsoDate;
  to: IsoDate;
  totalRanked: number;
  popular: RankedServer[];
  rising: RankedServer[];
  newcomers: RankedServer[];
  veterans: RankedServer[];
}

/** VersionSummary */
export interface VersionSummary {
  version: string;
  date: IsoDate;
  major: boolean;
  peakBefore: number | null;
  peakAfter: number | null;
  changePercent: number | null;
  peakServers: number;
  peakServersDate: IsoDate;
  peakSharePercent: number;
  daysToHalf: number | null;
  lastSeenDate: IsoDate;
  onlineServers: number;
}

/** VersionsResponse */
export interface VersionsResponse {
  generatedAt: IsoInstant;
  latest: string | null;
  versions: VersionSummary[];
}

/** VersionAdoptionDay */
export interface VersionAdoptionDay {
  date: IsoDate;
  servers: number;
  totalServers: number;
  sharePercent: number;
}

/** VersionDetailResponse */
export interface VersionDetailResponse {
  generatedAt: IsoInstant;
  summary: VersionSummary;
  previous: string | null;
  next: string | null;
  adoption: VersionAdoptionDay[];
}

/** ReportPeriodSummary. `period` is a month such as 2026-10 or a year such as 2025. */
export interface ReportPeriodSummary {
  period: string;
  kind: 'month' | 'year';
  from: IsoDate;
  to: IsoDate;
  days: number;
  peak: number;
  peakDate: IsoDate;
  avgDailyPeak: number;
}

/** ReportsResponse */
export interface ReportsResponse {
  generatedAt: IsoInstant;
  months: ReportPeriodSummary[];
  years: ReportPeriodSummary[];
}

/** ReportComparison */
export interface ReportComparison {
  period: string;
  avgDailyPeak: number;
  changePercent: number | null;
}

/** ReportCountry */
export interface ReportCountry {
  isoCode: string;
  avgDailyPeak: number;
  sharePercent: number;
  changePercent: number | null;
}

/** ReportServer */
export interface ReportServer extends ServerBrief {
  avgDailyPeak: number;
  peak: number;
}

/** ReportSeriesPoint. A month report has one per day, a year report one per month. */
export interface ReportSeriesPoint {
  date: IsoDate;
  peak: number;
  avgDailyPeak: number | null;
}

/** ReportResponse */
export interface ReportResponse {
  generatedAt: IsoInstant;
  summary: ReportPeriodSummary;
  lowest: DailyPlayerPeak;
  previous: ReportComparison | null;
  yearAgo: ReportComparison | null;
  previousPeriod: string | null;
  nextPeriod: string | null;
  activeServers: number;
  newServers: number;
  countries: ReportCountry[];
  servers: ReportServer[];
  releases: ReleaseImpact[];
  series: ReportSeriesPoint[];
}
