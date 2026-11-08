import Axios from 'axios';
import type {
  FluxTrendParams,
  ServerInsightsResponse,
  ServerSortOption,
  ServerSummary,
  ServerSummaryResponse,
} from '../../types/api';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 30_000,
});

/** GET /api/servers/{serverId} -> ServerSummary, or null when the server is unknown */
export function getServerInfoAPI(serverId: string) {
  return instance.get<ServerSummary | null>(`/servers/${serverId}`);
}

/**
 * GET /api/servers/{serverId}/graph
 * params: { startTime, stopTime?, aggregateEvery }
 * Returns: Flux CSV string body.
 */
export function getServerGraphAPI(serverId: string, params: FluxTrendParams) {
  return instance.get<string>(`/servers/${serverId}/graph`, { params });
}

/**
 * GET /api/v2/servers/{serverId}/insights
 * Returns: { serverId, generatedAt, history, heatmap }. `history` covers the whole
 * collection; `heatmap` holds 168 UTC hour-of-week slots, Monday 00:00 first.
 */
export function getServerInsightsAPI(serverId: string) {
  return instance.get<ServerInsightsResponse>(`/v2/servers/${serverId}/insights`);
}

/** POST /api/servers — body matches the legacy ServerSortOption shape */
export function getServerListAPI(data: ServerSortOption) {
  return instance.post<ServerSummaryResponse>('/servers', data);
}
