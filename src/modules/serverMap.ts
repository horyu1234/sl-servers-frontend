import {getServerMapAPI} from "../lib/api/map";
import type {ServerLoc} from "../types/api";
import type {AppThunk} from "./index";

const SERVER_MAP_FETCHING = "SERVER_MAP_FETCHING";
const SERVER_MAP_SUCCESS = "SERVER_MAP_SUCCESS";
const SERVER_MAP_FAILURE = "SERVER_MAP_FAILURE";

type ServerMapAction =
    | {type: typeof SERVER_MAP_FETCHING}
    | {type: typeof SERVER_MAP_SUCCESS; payload: ServerLoc[]}
    | {type: typeof SERVER_MAP_FAILURE; payload: unknown};

export const getServerMap = (): AppThunk<Promise<void>> => (dispatch) => {
    dispatch({type: SERVER_MAP_FETCHING});

    return getServerMapAPI().then(
        (response) => {
            dispatch({
                type: SERVER_MAP_SUCCESS,
                payload: response.data
            })
        }
    ).catch((error: unknown) => {
        dispatch({
            type: SERVER_MAP_FAILURE,
            payload: error
        });
    })
}

interface ServerMapState {
    fetching: boolean;
    error: boolean;
    data: ServerLoc[];
}

const initialState: ServerMapState = {
    fetching: false,
    error: false,
    data: []
}

export default function serverMap(state = initialState, action: ServerMapAction): ServerMapState {
    switch (action.type) {
        case SERVER_MAP_FETCHING:
            return {
                ...state,
                fetching: true,
                error: false,
                data: []
            };
        case SERVER_MAP_SUCCESS:
            return {
                ...state,
                fetching: false,
                data: action.payload
            };
        case SERVER_MAP_FAILURE:
            return {
                ...state,
                fetching: false,
                error: true,
                data: []
            };
        default:
            return state;
    }
}
