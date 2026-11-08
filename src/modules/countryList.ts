import {getCountryListAPI} from "../lib/api/countries";
import type {AppThunk} from "./index";

const COUNTRY_LIST_FETCHING = "COUNTRY_LIST_FETCHING";
const COUNTRY_LIST_SUCCESS = "COUNTRY_LIST_SUCCESS";
const COUNTRY_LIST_FAILURE = "COUNTRY_LIST_FAILURE";

type CountryListAction =
    | {type: typeof COUNTRY_LIST_FETCHING}
    | {type: typeof COUNTRY_LIST_SUCCESS; payload: string[]}
    | {type: typeof COUNTRY_LIST_FAILURE; payload: unknown};

export const getCountryList = (): AppThunk<Promise<void>> => (dispatch) => {
    dispatch({type: COUNTRY_LIST_FETCHING});

    return getCountryListAPI().then(
        (response) => {
            dispatch({
                type: COUNTRY_LIST_SUCCESS,
                payload: response.data
            })
        }
    ).catch((error: unknown) => {
        dispatch({
            type: COUNTRY_LIST_FAILURE,
            payload: error
        });
    })
}

interface CountryListState {
    fetching: boolean;
    error: boolean;
    data: string[];
}

const initialState: CountryListState = {
    fetching: false,
    error: false,
    data: []
}

export default function countryList(state = initialState, action: CountryListAction): CountryListState {
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
