import {getCountryListAPI} from "../lib/api/countries";

const COUNTRY_LIST_FETCHING = "COUNTRY_LIST_FETCHING";
const COUNTRY_LIST_SUCCESS = "COUNTRY_LIST_SUCCESS";
const COUNTRY_LIST_FAILURE = "COUNTRY_LIST_FAILURE";

export const getCountryList = () => (dispatch) => {
    dispatch({type: COUNTRY_LIST_FETCHING});

    return getCountryListAPI().then(
        (response) => {
            dispatch({
                type: COUNTRY_LIST_SUCCESS,
                payload: response.data
            })
        }
    ).catch(error => {
        dispatch({
            type: COUNTRY_LIST_FAILURE,
            payload: error
        });
    })
}

const initialState = {
    fetching: false,
    error: false,
    data: []
}

export default function countryList(state = initialState, action) {
    switch (action.type) {
        case COUNTRY_LIST_FETCHING:
            return {
                ...state,
                fetching: true,
                error: false,
                data: []
            };
        case COUNTRY_LIST_SUCCESS:
            return {
                ...state,
                fetching: false,
                data: action.payload
            };
        case COUNTRY_LIST_FAILURE:
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
