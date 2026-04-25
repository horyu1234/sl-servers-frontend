import Cookies from 'js-cookie';

const SETTING_SI_CHANGE = "SETTING/SI_CHANGE";

export const COOKIE_USER_SI = 'user.si';

export const changeSi = (data) => dispatch => {
    dispatch({
        type: SETTING_SI_CHANGE,
        payload: data
    })
}

const initialState = {
    si: Cookies.get(COOKIE_USER_SI) || 'km'
}

export default function setting(state = initialState, action) {
    switch (action.type) {
        case SETTING_SI_CHANGE:
            return {
                ...state,
                si: action.payload
            };
        default:
            return state;
    }
}
