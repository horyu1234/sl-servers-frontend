import Axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 10000,
});

/**
 * GET /api/servers/trends
 * Returns the parsed ServerTrendsResponse:
 *   { window, resolution, bucketCount, endTime, serverIds, trends }
 *   trends: { [serverId: string]: Array<number | null> } (oldest -> newest)
 */
export function getServersTrendsAPI({ window = '24h', resolution = '1h' } = {}) {
  return instance.get('/servers/trends', { params: { window, resolution } });
}
