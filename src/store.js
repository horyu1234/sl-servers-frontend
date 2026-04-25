import {configureStore} from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import rootReducer from "./modules";
import {COOKIE_USER_SI} from "./modules/setting";

const store = configureStore({
    reducer: rootReducer,
});

const setCookie = (key, value) => {
    if (Cookies.get(key) === value) return;
    Cookies.set(key, value);
}

store.subscribe(() => {
    const state = store.getState();

    setCookie(COOKIE_USER_SI, state.setting.si);
})

export default store;
