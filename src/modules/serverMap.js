import {getServerMapAPI} from "../apiClient";

const SERVER_MAP_FETCHING = "SERVER_MAP_FETCHING";
const SERVER_MAP_SUCCESS = "SERVER_MAP_SUCCESS";
const SERVER_MAP_FAILURE = "SERVER_MAP_FAILURE";

export const getServerMap = () => (dispatch) => {
    dispatch({type: SERVER_MAP_FETCHING});

    return getServerMapAPI().then(
        (response) => {
            dispatch({
                type: SERVER_MAP_SUCCESS,
                payload: response.data
            })
        }
    ).catch(error => {
        dispatch({
            type: SERVER_MAP_FAILURE,
            payload: error
        });
    })
}

const initialState = {
    fetching: false,
    error: false,
    data: []
}

export default function serverMap(state = initialState, action) {
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
