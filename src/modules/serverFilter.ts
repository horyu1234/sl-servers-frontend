import type {ServerSortOption, ServerSortType, TriState} from "../types/api";

const SERVER_FILTER_SEARCH_CHANGE = "SERVER_FILTER/SEARCH_CHANGE";
const SERVER_FILTER_COUNTRY_CHANGE = "SERVER_FILTER/COUNTRY_CHANGE";
const SERVER_FILTER_HIDE_EMPTY_CHANGE = "SERVER_FILTER/HIDE_EMPTY_CHANGE";
const SERVER_FILTER_HIDE_FULL_CHANGE = "SERVER_FILTER/HIDE_FULL_CHANGE";
const SERVER_FILTER_FRIENDLY_FIRE_CHANGE = "SERVER_FILTER/FRIEND_FIRE_CHANGE";
const SERVER_FILTER_WHITELIST_CHANGE = "SERVER_FILTER/WHITELIST_CHANGE";
const SERVER_FILTER_MODDED_CHANGE = "SERVER_FILTER/MODDED_CHANGE";
const SERVER_FILTER_SORT_TYPE_CHANGE = "SERVER_FILTER/SORT_TYPE_CHANGE";

// 액션 생성자
export const changeSearch = (payload: string) => ({type: SERVER_FILTER_SEARCH_CHANGE, payload} as const);
export const changeCountry = (payload: string[]) => ({type: SERVER_FILTER_COUNTRY_CHANGE, payload} as const);
export const changeHideEmpty = (payload: boolean) => ({type: SERVER_FILTER_HIDE_EMPTY_CHANGE, payload} as const);
export const changeHideFull = (payload: boolean) => ({type: SERVER_FILTER_HIDE_FULL_CHANGE, payload} as const);
export const changeFriendlyFire = (payload: TriState) => ({type: SERVER_FILTER_FRIENDLY_FIRE_CHANGE, payload} as const);
export const changeWhitelist = (payload: TriState) => ({type: SERVER_FILTER_WHITELIST_CHANGE, payload} as const);
export const changeModded = (payload: TriState) => ({type: SERVER_FILTER_MODDED_CHANGE, payload} as const);
export const changeSortType = (payload: ServerSortType) => ({type: SERVER_FILTER_SORT_TYPE_CHANGE, payload} as const);

type ServerFilterAction = ReturnType<
    | typeof changeSearch
    | typeof changeCountry
    | typeof changeHideEmpty
    | typeof changeHideFull
    | typeof changeFriendlyFire
    | typeof changeWhitelist
    | typeof changeModded
    | typeof changeSortType
>;

const initialState: ServerSortOption = {
    search: '',
    countryFilter: [],
    hideEmptyServer: false,
    hideFullServer: false,
    friendlyFire: 'null',
    whitelist: 'null',
    modded: 'null',
    sort: 'INGAME_ORDER'
}

export default function serverFilter(state = initialState, action: ServerFilterAction): ServerSortOption {
    switch (action.type) {
        case SERVER_FILTER_SEARCH_CHANGE:
            return {...state, search: action.payload};
        case SERVER_FILTER_COUNTRY_CHANGE:
            return {...state, countryFilter: action.payload};
        case SERVER_FILTER_HIDE_EMPTY_CHANGE:
            return {...state, hideEmptyServer: action.payload};
        case SERVER_FILTER_HIDE_FULL_CHANGE:
            return {...state, hideFullServer: action.payload};
        case SERVER_FILTER_FRIENDLY_FIRE_CHANGE:
            return {...state, friendlyFire: action.payload};
        case SERVER_FILTER_WHITELIST_CHANGE:
            return {...state, whitelist: action.payload};
        case SERVER_FILTER_MODDED_CHANGE:
            return {...state, modded: action.payload};
        case SERVER_FILTER_SORT_TYPE_CHANGE:
            return {...state, sort: action.payload};
        default:
            return state;
    }
}
