import {DEFAULT_FILTER} from "../lib/filters/filterSchema";
import type {ServerFilter} from "../lib/filters/filterSchema";

const SERVER_FILTER_REPLACE = "SERVER_FILTER/REPLACE";

// The URL is the source of truth for the list filter, so the store only ever takes it whole.
export const replaceFilter = (payload: ServerFilter) => ({type: SERVER_FILTER_REPLACE, payload} as const);

type ServerFilterAction = ReturnType<typeof replaceFilter>;

export default function serverFilter(state: ServerFilter = DEFAULT_FILTER, action: ServerFilterAction): ServerFilter {
    switch (action.type) {
        case SERVER_FILTER_REPLACE:
            return action.payload;
        default:
            return state;
    }
}
