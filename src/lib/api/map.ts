import Axios from 'axios';
import type { ServerLoc } from '../../types/api';

const baseURL = import.meta.env.VITE_API_URL;
const instance = Axios.create({ baseURL, timeout: 10_000 });

/** GET /api/map — list of {serverId, info, location:{lat, long}} */
export function getServerMapAPI() {
  return instance.get<ServerLoc[]>('/map');
}
