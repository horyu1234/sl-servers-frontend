// Builds the page model of an address from the API, for the HTML the edge function sends.
import type { SiteContext } from '../site/context';
import type { PageModel } from '../site/pageModel';
import { creditModel, listModel, mapModel, notFoundModel, statsModel } from '../site/pages/basic';
import { countriesModel, countryModel } from '../site/pages/countries';
import { docModel } from '../site/pages/docs';
import { fallbackModel } from '../site/pages/fallback';
import { rankingsModel } from '../site/pages/rankings';
import { recordsModel } from '../site/pages/records';
import { reportModel, reportsModel } from '../site/pages/reports';
import { serverModel } from '../site/pages/server';
import { versionModel, versionsModel } from '../site/pages/versions';
import type { Route } from '../site/routes';
import type {
  CountriesResponse, CountryDetailResponse, GlobalHistoryResponse, RankingsResponse, ReportResponse,
  ReportsResponse, ServerInsightsResponse, ServerSummary, VersionDetailResponse, VersionsResponse,
} from '../types/api';
import type { Api, CachePolicy } from './api';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// How long an answer is used as it is, and how long it may still be shown while a new one loads.
// The page the visitor ends up with always loads live data, so an old answer only affects the
// first paint and what crawlers read.
const LIVE: CachePolicy = { freshSeconds: 5 * MINUTE, staleSeconds: DAY };
const HOURLY: CachePolicy = { freshSeconds: 10 * MINUTE, staleSeconds: DAY };
const SLOW: CachePolicy = { freshSeconds: HOUR, staleSeconds: 7 * DAY };
// A finished month or year does not change.
const FINISHED: CachePolicy = { freshSeconds: DAY, staleSeconds: 30 * DAY };

export const API_PATHS = {
  countries: '/api/v2/countries',
  country: (isoCode: string) => `/api/v2/countries/${isoCode.toUpperCase()}`,
  rankings: '/api/v2/rankings',
  versions: '/api/v2/versions',
  version: (version: string) => `/api/v2/versions/${version}`,
  reports: '/api/v2/reports',
  report: (period: string) => `/api/v2/reports/${period}`,
  history: '/api/stats/history',
  server: (serverId: string) => `/api/servers/${serverId}`,
  insights: (serverId: string) => `/api/v2/servers/${serverId}/insights`,
  onlineServers: '/api/v2/servers',
};

export const POLICIES = { LIVE, HOURLY, SLOW, FINISHED };

export interface BuiltPage {
  status: 200 | 404;
  model: PageModel;
}

function found(model: PageModel): BuiltPage {
  return { status: 200, model };
}

function missing(ctx: SiteContext): BuiltPage {
  return { status: 404, model: notFoundModel(ctx) };
}

/**
 * A page whose data did not arrive still answers 200 with its title. Only a list that did
 * arrive and does not hold the item proves that the page does not exist.
 */
function withoutData(ctx: SiteContext, route: Route): BuiltPage {
  return found(fallbackModel(ctx, route) ?? notFoundModel(ctx));
}

export async function buildPage(ctx: SiteContext, route: Route | null, api: Api): Promise<BuiltPage> {
  if (!route) return missing(ctx);
  const { page, params } = route;

  switch (page) {
    case 'list': {
      const [rankings, countries] = await Promise.all([
        api.get<RankingsResponse>(API_PATHS.rankings, HOURLY),
        api.get<CountriesResponse>(API_PATHS.countries, HOURLY),
      ]);
      return found(listModel(ctx, { rankings: rankings?.data, countries: countries?.data }));
    }
    case 'server': {
      const [server, insights] = await Promise.all([
        api.get<ServerSummary | null>(API_PATHS.server(params.serverId), LIVE),
        api.get<ServerInsightsResponse>(API_PATHS.insights(params.serverId), LIVE),
      ]);
      if (!server) return withoutData(ctx, route);
      if (!server.data) return missing(ctx);
      return found(serverModel(ctx, server.data, insights?.data ?? null));
    }
    case 'stats': {
      const history = await api.get<GlobalHistoryResponse>(API_PATHS.history, HOURLY);
      return found(statsModel(ctx, history?.data));
    }
    case 'map':
      return found(mapModel(ctx));
    case 'credit':
      return found(creditModel(ctx));
    case 'countries': {
      const countries = await api.get<CountriesResponse>(API_PATHS.countries, HOURLY);
      return countries ? found(countriesModel(ctx, countries.data)) : withoutData(ctx, route);
    }
    case 'country': {
      const isoCode = params.isoCode.toUpperCase();
      const [countries, country] = await Promise.all([
        api.get<CountriesResponse>(API_PATHS.countries, HOURLY),
        api.get<CountryDetailResponse>(API_PATHS.country(isoCode), HOURLY),
      ]);
      if (country) return found(countryModel(ctx, country.data));
      if (countries && !countries.data.countries.some((entry) => entry.isoCode === isoCode)) return missing(ctx);
      return withoutData(ctx, route);
    }
    case 'versions': {
      const versions = await api.get<VersionsResponse>(API_PATHS.versions, SLOW);
      return versions ? found(versionsModel(ctx, versions.data)) : withoutData(ctx, route);
    }
    case 'version': {
      const [versions, version] = await Promise.all([
        api.get<VersionsResponse>(API_PATHS.versions, SLOW),
        api.get<VersionDetailResponse>(API_PATHS.version(params.version), SLOW),
      ]);
      if (version) return found(versionModel(ctx, version.data));
      if (versions && !versions.data.versions.some((entry) => entry.version === params.version)) return missing(ctx);
      return withoutData(ctx, route);
    }
    case 'rankings': {
      const rankings = await api.get<RankingsResponse>(API_PATHS.rankings, HOURLY);
      return rankings ? found(rankingsModel(ctx, rankings.data)) : withoutData(ctx, route);
    }
    case 'records': {
      const [history, countries] = await Promise.all([
        api.get<GlobalHistoryResponse>(API_PATHS.history, HOURLY),
        api.get<CountriesResponse>(API_PATHS.countries, HOURLY),
      ]);
      return history ? found(recordsModel(ctx, history.data, countries?.data ?? null)) : withoutData(ctx, route);
    }
    case 'reports': {
      const reports = await api.get<ReportsResponse>(API_PATHS.reports, SLOW);
      return reports ? found(reportsModel(ctx, reports.data)) : withoutData(ctx, route);
    }
    case 'report': {
      const [reports, report] = await Promise.all([
        api.get<ReportsResponse>(API_PATHS.reports, SLOW),
        api.get<ReportResponse>(API_PATHS.report(params.period), FINISHED),
      ]);
      if (report) return found(reportModel(ctx, report.data));
      const periods = reports ? [...reports.data.months, ...reports.data.years] : null;
      if (periods && !periods.some((entry) => entry.period === params.period)) return missing(ctx);
      return withoutData(ctx, route);
    }
    case 'api':
    case 'about':
    case 'methodology':
    case 'privacy':
    case 'contact': {
      const model = docModel(ctx, page);
      return model ? found(model) : missing(ctx);
    }
  }
}
