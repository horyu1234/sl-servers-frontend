import Axios from 'axios';
import type {
  CountriesResponse,
  CountryDetailResponse,
  RankingsResponse,
  ReportResponse,
  ReportsResponse,
  VersionDetailResponse,
  VersionsResponse,
} from '../../types/api';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 30_000,
});

/** GET /api/v2/countries */
export function getCountriesAPI() {
  return instance.get<CountriesResponse>('/v2/countries');
}

/** GET /api/v2/countries/{isoCode}. 404 for a country without servers or recent data. */
export function getCountryAPI(isoCode: string) {
  return instance.get<CountryDetailResponse>(`/v2/countries/${encodeURIComponent(isoCode)}`);
}

/** GET /api/v2/rankings */
export function getRankingsAPI() {
  return instance.get<RankingsResponse>('/v2/rankings');
}

/** GET /api/v2/versions */
export function getVersionsAPI() {
  return instance.get<VersionsResponse>('/v2/versions');
}

/** GET /api/v2/versions/{version}. 404 for a version that is not a detected release. */
export function getVersionAPI(version: string) {
  return instance.get<VersionDetailResponse>(`/v2/versions/${encodeURIComponent(version)}`);
}

/** GET /api/v2/reports */
export function getReportsAPI() {
  return instance.get<ReportsResponse>('/v2/reports');
}

/** GET /api/v2/reports/{period}. 404 for a period that is not finished or has no data. */
export function getReportAPI(period: string) {
  return instance.get<ReportResponse>(`/v2/reports/${encodeURIComponent(period)}`);
}
