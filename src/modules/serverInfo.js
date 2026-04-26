import {getServerInfoAPI} from "../lib/api/servers";

const SERVER_INFO_FETCHING = "SERVER_INFO_FETCHING";
const SERVER_INFO_SUCCESS = "SERVER_INFO_SUCCESS";
const SERVER_INFO_FAILURE = "SERVER_INFO_FAILURE";

export const getServerInfo = (serverId) => dispatch => {
    dispatch({type: SERVER_INFO_FETCHING});

    return getServerInfoAPI(serverId).then(
        (response) => {
            dispatch({
                type: SERVER_INFO_SUCCESS,
                payload: response.data
            })
        }
    ).catch(error => {
        dispatch({
            type: SERVER_INFO_FAILURE,
            payload: error
        });
    })
}

const initialState = {
    fetching: false,
    error: false,
    data: {}
}

export default function serverInfo(state = initialState, action) {
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
