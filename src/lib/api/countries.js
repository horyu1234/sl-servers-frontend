import Axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
const instance = Axios.create({ baseURL, timeout: 10_000 });

/** GET /api/stats/country — list of ISO codes for which we have data */
export function getCountryListAPI() {
  return instance.get('/stats/country');
}
