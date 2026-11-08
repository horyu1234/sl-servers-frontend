import {getServerInfoAPI} from "../lib/api/servers";
import type {ServerSummary} from "../types/api";
import type {AppThunk} from "./index";

const SERVER_INFO_FETCHING = "SERVER_INFO_FETCHING";
const SERVER_INFO_SUCCESS = "SERVER_INFO_SUCCESS";
const SERVER_INFO_FAILURE = "SERVER_INFO_FAILURE";

// {} until a load finishes. null when the API has no such server: it answers
// GET /api/servers/{id} with an Optional, which is empty for an unknown id.
type ServerInfoData = ServerSummary | Record<string, never> | null;

type ServerInfoAction =
    | {type: typeof SERVER_INFO_FETCHING}
    | {type: typeof SERVER_INFO_SUCCESS; payload: ServerSummary | null}
    | {type: typeof SERVER_INFO_FAILURE; payload: unknown};

export function isServerLoaded(data: ServerInfoData): data is ServerSummary {
    return data !== null && Object.keys(data).length > 0;
}

export const getServerInfo = (serverId: string): AppThunk<Promise<void>> => dispatch => {
    dispatch({type: SERVER_INFO_FETCHING});

    return getServerInfoAPI(serverId).then(
        (response) => {
            dispatch({
                type: SERVER_INFO_SUCCESS,
                payload: response.data
            })
        }
    ).catch((error: unknown) => {
        dispatch({
            type: SERVER_INFO_FAILURE,
            payload: error
        });
    })
}

interface ServerInfoState {
    fetching: boolean;
    error: boolean;
    data: ServerInfoData;
}

const initialState: ServerInfoState = {
    fetching: false,
    error: false,
    data: {}
}

export default function serverInfo(state = initialState, action: ServerInfoAction): ServerInfoState {
    switch (action.type) {
        case SERVER_INFO_FETCHING:
            return {
                ...state,
                fetching: true,
                error: false,
                data: {}
            };
        case SERVER_INFO_SUCCESS:
            return {
                ...state,
                fetching: false,
                data: action.payload
            };
        case SERVER_INFO_FAILURE:
            return {
                ...state,
                fetching: false,
                error: true,
                data: {}
            };
        default:
            return state;
    }
}
