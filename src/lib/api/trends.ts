import Axios from 'axios';
import type { ServerTrendsResolution, ServerTrendsResponse, ServerTrendsWindow } from '../../types/api';

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
 * The response covers every server in one shot. There used to be a
 * companion POST /v2/servers/trends/batch for fetching only a visible
 * subset, but it was removed on the backend; useTrends now fetches once
 * and caches the full map.
 */
export function getServersTrendsAPI({ window = '7d', resolution = '1h' }: {
  window?: ServerTrendsWindow;
  resolution?: ServerTrendsResolution;
} = {}) {
  return instance.get<ServerTrendsResponse>('/v2/servers/trends', { params: { window, resolution } });
}
