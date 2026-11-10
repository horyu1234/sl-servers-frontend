import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Container from "./shell/Container";
import {NotFound, PAGES} from './pages';
import {ROUTE_PATTERNS, parsePath} from '../site/routes';

const Loading = () => (
    <div className="flex items-center justify-center" style={{height: '100vh'}}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
);

// The router only matches the shape of an address. parsePath also checks the parameters and the
// language prefix, the same way the edge function does, so both agree on what is a 404.
const Page = () => {
    const {pathname} = useLocation();
    const {i18n} = useTranslation();
    const {route, language} = parsePath(pathname);

    // An address like /ko/stats names its language. Running only when that language changes lets
    // the language menu switch first and move to the new address after.
    useEffect(() => {
        if (language && i18n.language !== language) i18n.changeLanguage(language);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    const View = route ? PAGES[route.page] : NotFound;
    return <Container view={<View/>}/>;
};

const App = () => (
    <BrowserRouter>
        <React.Suspense fallback={<Loading />}>
            <Routes>
                {ROUTE_PATTERNS.map(({page, pattern}) => (
                    <React.Fragment key={page}>
                        <Route path={`/${pattern}`} element={<Page/>}/>
                        <Route path={`/:language/${pattern}`} element={<Page/>}/>
                    </React.Fragment>
                ))}
                <Route path="*" element={<Page/>}/>
            </Routes>
        </React.Suspense>
    </BrowserRouter>
);

export default App;
