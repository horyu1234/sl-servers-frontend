import type {AxiosError} from "axios";
import {toRequestBody} from "../lib/filters/filterSchema";
import {getServerListAPI} from "../lib/api/servers";
import type {ServerSummaryResponse} from "../types/api";
import type {AppThunk} from "./index";

const SERVER_LIST_FETCHING = "SERVER_LIST_FETCHING";
const SERVER_LIST_SUCCESS = "SERVER_LIST_SUCCESS";
const SERVER_LIST_FAILURE = "SERVER_LIST_FAILURE";

export interface ServerListError {
    message: string;
    code: string | null;
    status: number | null;
    statusText: string | null;
    method: string | null;
    url: string | null;
    baseURL: string | null;
    data: unknown;
    online: boolean | null;
}

type ServerListAction =
    | {type: typeof SERVER_LIST_FETCHING}
    | {type: typeof SERVER_LIST_SUCCESS; payload: ServerSummaryResponse}
    | {type: typeof SERVER_LIST_FAILURE; payload: ServerListError};

export const getServerList = (): AppThunk<Promise<void>> => (dispatch, getState) => {
    dispatch({type: SERVER_LIST_FETCHING});

    const state = getState();
    return getServerListAPI(toRequestBody(state.serverFilter)).then(
        (response) => {
            dispatch({
                type: SERVER_LIST_SUCCESS,
                payload: response.data
            })
        }
    ).catch((thrown: unknown) => {
        // Anything can land here, so every field stays optional rather than assuming AxiosError.
        const error = thrown as Partial<AxiosError> | null | undefined;
        const detail: ServerListError = {
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

export interface ServerListState {
    fetching: boolean;
    error: ServerListError | null;
    data: ServerSummaryResponse;
}

const initialState: ServerListState = {
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

export default function serverList(state = initialState, action: ServerListAction): ServerListState {
    switch (action.type) {
        case SERVER_LIST_FETCHING:
            return {
                ...state,
                fetching: true,
                error: null
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
