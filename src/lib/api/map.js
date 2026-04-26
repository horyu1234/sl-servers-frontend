import Axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
const instance = Axios.create({ baseURL, timeout: 10_000 });

/** GET /api/map — list of {serverId, info, location:{lat, long}} */
export function getServerMapAPI() {
  return instance.get('/map');
}
