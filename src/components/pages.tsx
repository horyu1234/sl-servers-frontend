import React from 'react';
import type {ComponentType, FunctionComponent} from 'react';
import {parsePath} from '../site/routes';
import type {PageName} from '../site/routes';

type PageModule = {default: ComponentType};

type LazyPage = FunctionComponent & {
    preload: () => Promise<void>;
};

// A lazy page that draws at once when its code is already here. main.tsx loads the code of the
// first page before React starts, so the HTML from the edge stays on screen until the page can
// replace it, with no spinner in between.
function lazyPage(load: () => Promise<PageModule>): LazyPage {
    let loaded: ComponentType | null = null;
    const Lazy = React.lazy(load);

    const Page: FunctionComponent = () => {
        const View = loaded ?? Lazy;
        return <View/>;
    };
    const preload = () => load().then((module) => {
        loaded = module.default;
    });
    return Object.assign(Page, {preload});
}

const DocPage = lazyPage(() => import('../pages/doc/DocPage'));

export const NotFound = lazyPage(() => import('../pages/NotFound'));

export const PAGES: Record<PageName, LazyPage> = {
    list: lazyPage(() => import('../pages/list/List')),
    server: lazyPage(() => import('../pages/info/Info')),
    stats: lazyPage(() => import('../pages/stats/Stats')),
    map: lazyPage(() => import('../pages/map/Map')),
    credit: lazyPage(() => import('../pages/credit/Credit')),
    api: lazyPage(() => import('../pages/api/Api')),
    countries: lazyPage(() => import('../pages/countries/Countries')),
    country: lazyPage(() => import('../pages/countries/Country')),
    versions: lazyPage(() => import('../pages/versions/Versions')),
    version: lazyPage(() => import('../pages/versions/Version')),
    rankings: lazyPage(() => import('../pages/rankings/Rankings')),
    records: lazyPage(() => import('../pages/records/Records')),
    reports: lazyPage(() => import('../pages/reports/Reports')),
    report: lazyPage(() => import('../pages/reports/Report')),
    about: DocPage,
    methodology: DocPage,
    privacy: DocPage,
    contact: DocPage,
};

/** Loads the code of the page at an address. Never rejects: a failed load is left to React. */
export function preloadPage(pathname: string) {
    const {route} = parsePath(pathname);
    return (route ? PAGES[route.page] : NotFound).preload().catch(() => undefined);
}
