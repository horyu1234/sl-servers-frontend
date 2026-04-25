const SERVER_FILTER_SEARCH_CHANGE = "SERVER_FILTER/SEARCH_CHANGE";
const SERVER_FILTER_COUNTRY_CHANGE = "SERVER_FILTER/COUNTRY_CHANGE";
const SERVER_FILTER_HIDE_EMPTY_CHANGE = "SERVER_FILTER/HIDE_EMPTY_CHANGE";
const SERVER_FILTER_HIDE_FULL_CHANGE = "SERVER_FILTER/HIDE_FULL_CHANGE";
const SERVER_FILTER_FRIENDLY_FIRE_CHANGE = "SERVER_FILTER/FRIEND_FIRE_CHANGE";
const SERVER_FILTER_WHITELIST_CHANGE = "SERVER_FILTER/WHITELIST_CHANGE";
const SERVER_FILTER_MODDED_CHANGE = "SERVER_FILTER/MODDED_CHANGE";
const SERVER_FILTER_SORT_TYPE_CHANGE = "SERVER_FILTER/SORT_TYPE_CHANGE";

// 액션 생성자
export const changeSearch = (payload) => ({type: SERVER_FILTER_SEARCH_CHANGE, payload});
export const changeCountry = (payload) => ({type: SERVER_FILTER_COUNTRY_CHANGE, payload});
export const changeHideEmpty = (payload) => ({type: SERVER_FILTER_HIDE_EMPTY_CHANGE, payload});
export const changeHideFull = (payload) => ({type: SERVER_FILTER_HIDE_FULL_CHANGE, payload});
export const changeFriendlyFire = (payload) => ({type: SERVER_FILTER_FRIENDLY_FIRE_CHANGE, payload});
export const changeWhitelist = (payload) => ({type: SERVER_FILTER_WHITELIST_CHANGE, payload});
export const changeModded = (payload) => ({type: SERVER_FILTER_MODDED_CHANGE, payload});
export const changeSortType = (payload) => ({type: SERVER_FILTER_SORT_TYPE_CHANGE, payload});

const initialState = {
    search: '',
    countryFilter: [],
    hideEmptyServer: false,
    hideFullServer: false,
    friendlyFire: 'null',
    whitelist: 'null',
    modded: 'null',
    sort: 'DISTANCE_ASC'
}

export default function serverFilter(state = initialState, action) {
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
