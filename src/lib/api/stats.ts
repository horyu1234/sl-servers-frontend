import Axios from 'axios';
import type { FluxTrendParams, GlobalHistoryResponse, ModLoaderCounts } from '../../types/api';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 30_000, // graph queries can be slower than list calls
});

/**
 * GET /api/stats/country/{isoCodes}/graph
 * isoCodes: array of ISO codes plus optional 'ALL'
 * params: { startTime, stopTime?, aggregateEvery }
 * Returns: Flux CSV string (raw text body).
 */
export function getCountryTrendAPI(isoCodes: string[], params: FluxTrendParams) {
  const path = isoCodes.join(',');
  return instance.get<string>(`/stats/country/${path}/graph`, { params });
}

/**
 * GET /api/stats/history
 * Returns: { generatedAt, daily, records, releases, gaps, latest, todayPeakSoFar }.
 * Dates are UTC days.
 */
export function getGlobalHistoryAPI() {
  return instance.get<GlobalHistoryResponse>('/stats/history');
}

/**
 * GET /api/stats/mod-loader
 * Returns: { [modLoaderName]: { [version]: count } }
 */
export function getModLoaderChartAPI() {
  return instance.get<ModLoaderCounts>('/stats/mod-loader');
}
