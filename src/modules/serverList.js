import {getServerListAPI} from "../lib/api/servers";

const SERVER_LIST_FETCHING = "SERVER_LIST_FETCHING";
const SERVER_LIST_SUCCESS = "SERVER_LIST_SUCCESS";
const SERVER_LIST_FAILURE = "SERVER_LIST_FAILURE";

export const getServerList = () => (dispatch, getState) => {
    dispatch({type: SERVER_LIST_FETCHING});

    const state = getState();
    return getServerListAPI(state.serverFilter).then(
        (response) => {
            dispatch({
                type: SERVER_LIST_SUCCESS,
                payload: response.data
            })
        }
    ).catch(error => {
        const detail = {
            message: error?.message ?? 'Unknown error',
            code: error?.code ?? null,
            status: error?.response?.status ?? null,
            statusText: error?.response?.statusText ?? null,
            method: error?.config?.method ? error.config.method.toUpperCase() : null,
            url: error?.config?.url ?? null,
            baseURL: error?.config?.baseURL ?? null,
            data: typeof error?.response?.data === 'string'
                ? error.response.data.slice(0, 500)
                : error?.response?.data ?? null,
            online: typeof navigator !== 'undefined' ? navigator.onLine : null,
        };
        dispatch({
            type: SERVER_LIST_FAILURE,
            payload: detail
        });
    })
}

const initialState = {
    fetching: false,
    error: null,
    data: {
        displayServerCount: 0,
        displayUserCount: 0,
        offlineServerCount: 0,
        onlineServerCount: 0,
        onlineUserCount: 0,
        servers: []
    }
}

export default function serverList(state = initialState, action) {
    switch (action.type) {
        case SERVER_LIST_FETCHING:
            return {
                ...state,
                fetching: true,
                error: null,
                data: {
                    ...state.data,
                    servers: []
                }
            };
        case SERVER_LIST_SUCCESS:
            return {
                ...state,
                fetching: false,
                data: action.payload
            };
        case SERVER_LIST_FAILURE:
            return {
                ...state,
                fetching: false,
                error: action.payload,
                data: {
                    ...state.data,
                    servers: []
                }
            };
        default:
            return state;
    }
}
