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
