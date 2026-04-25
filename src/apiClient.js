import Axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const instance = Axios.create({
    baseURL,
    timeout: 10000,
});

export const getServerListAPI = (data) => {
    return instance.post(`/servers`, data);
}

export const getServerInfoAPI = (serverId) => {
    return instance.get(`/servers/${serverId}`);
}

export const getServerGraphAPI = (serverId, params) => {
    return instance.get(`/servers/${serverId}/graph`, {params});
}

export const getCountryListAPI = () => {
    return instance.get(`/stats/country`);
}

export const getCountryTrendAPI = (isoCodes, params) => {
    return instance.get(`/stats/country/${isoCodes}/graph`, {params});
}

export const getModLoaderChartAPI = () => {
    return instance.get(`/stats/mod-loader`);
}

export const getServerMapAPI = () => {
    return instance.get(`/map`);
}
