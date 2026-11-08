import Cookies from 'js-cookie';
import type {AppThunk} from "./index";

const SETTING_SI_CHANGE = "SETTING/SI_CHANGE";

export const COOKIE_USER_SI = 'user.si';

type SettingAction = {type: typeof SETTING_SI_CHANGE; payload: string};

export const changeSi = (data: string): AppThunk => dispatch => {
    dispatch({
        type: SETTING_SI_CHANGE,
        payload: data
    })
}

interface SettingState {
    si: string;
}

const initialState: SettingState = {
    si: Cookies.get(COOKIE_USER_SI) || 'km'
}

export default function setting(state = initialState, action: SettingAction): SettingState {
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
