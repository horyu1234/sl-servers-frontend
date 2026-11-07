import Axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
  baseURL,
  timeout: 30_000,
});

/** GET /api/servers/{serverId} -> ServerSummary */
export function getServerInfoAPI(serverId) {
  return instance.get(`/servers/${serverId}`);
}

/**
 * GET /api/servers/{serverId}/graph
 * params: { startTime, stopTime?, aggregateEvery }
 * Returns: Flux CSV string body.
 */
export function getServerGraphAPI(serverId, params) {
  return instance.get(`/servers/${serverId}/graph`, { params });
}

/**
 * GET /api/v2/servers/{serverId}/insights
 * Returns: { serverId, generatedAt, history, heatmap }. `history` covers the whole
 * collection; `heatmap` holds 168 UTC hour-of-week slots, Monday 00:00 first.
 */
export function getServerInsightsAPI(serverId) {
  return instance.get(`/v2/servers/${serverId}/insights`);
}

/** POST /api/servers — body matches the legacy ServerSortOption shape */
export function getServerListAPI(data) {
  return instance.post('/servers', data);
}
