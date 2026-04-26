import Axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 10000,
});

/**
 * GET /api/v2/servers/trends
 *
 * The trends endpoint moved to /v2 (sl-servers-parent commit eb20e11).
 * Other endpoints stayed on the legacy /api/* prefix.
 *
 * Returns the parsed ServerTrendsResponse:
 *   { window, resolution, bucketCount, endTime, serverIds, trends }
 *   trends: { [serverId: string]: Array<number | null> } (oldest -> newest)
 *
 * A POST /v2/servers/trends/batch endpoint is also available with
 *   { serverIds: number[], window?, resolution? }
 * for fetching trends for only a visible subset — a future useTrends
 * optimization could switch to that for large server lists.
 */
export function getServersTrendsAPI({ window = '24h', resolution = '1h' } = {}) {
  return instance.get('/v2/servers/trends', { params: { window, resolution } });
}

/**
 * POST /api/v2/servers/trends/batch
 * Same response shape as /trends, but limited to the requested serverIds.
 * Useful when only a subset of the server list is visible (virtualization).
 */
export function getServersTrendsBatchAPI({ serverIds, window = '24h', resolution = '1h' }) {
  return instance.post('/v2/servers/trends/batch', { serverIds, window, resolution });
}
