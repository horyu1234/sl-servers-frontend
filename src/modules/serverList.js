import {getServerListAPI} from "../apiClient";

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
        dispatch({
            type: SERVER_LIST_FAILURE,
            payload: error
        });
    })
}

const initialState = {
    fetching: false,
    error: false,
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
                error: false,
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
                error: true,
                data: {
                    ...state.data,
                    servers: []
                }
            };
        default:
            return state;
    }
}
