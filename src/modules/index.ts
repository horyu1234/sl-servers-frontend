import {combineReducers} from "@reduxjs/toolkit";
import type {ThunkAction, UnknownAction} from "@reduxjs/toolkit";
import setting from "./setting";
import countryList from "./countryList";
import serverFilter from "./serverFilter";
import serverList from "./serverList";
import serverInfo from "./serverInfo";
import serverMap from "./serverMap";

const rootReducer = combineReducers({
    setting,
    countryList,
    serverFilter,
    serverList,
    serverInfo,
    serverMap
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<Result = void> = ThunkAction<Result, RootState, unknown, UnknownAction>;

export default rootReducer;
