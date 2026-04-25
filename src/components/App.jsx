import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Container from "./Container";
import {ToastContainer} from "react-toastify";
import {CookieConsent} from "react-cookie-consent";
import {useTranslation} from "react-i18next";

import 'react-toastify/dist/ReactToastify.min.css';

const Info = React.lazy(() => import('../pages/info/Info'));
const List = React.lazy(() => import('../pages/list/List'));
const Map = React.lazy(() => import('../pages/map/Map'));
const Stats = React.lazy(() => import('../pages/stats/Stats'));
const Credit = React.lazy(() => import('../pages/credit/Credit'));
const Api = React.lazy(() => import('../pages/api/Api'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// Loading component with spinner
const Loading = () => (
    <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="sr-only">Loading...</span>
        </div>
    </div>
);

const App = () => {
    const {t} = useTranslation();

    return (
        <>
            <BrowserRouter>
                <React.Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<Container view={<List/>}/>}/>
                        <Route path="/servers/:serverId" element={<Container view={<Info/>}/>}/>
                        <Route path="/stats" element={<Container view={<Stats/>}/>}/>
                        <Route path="/map" element={<Container view={<Map/>}/>}/>
                        <Route path="/credit" element={<Container view={<Credit/>}/>}/>
                        <Route path="/api" element={<Container view={<Api/>}/>}/>
                        <Route path="*" element={<Container view={<NotFound/>}/>}/>
                    </Routes>
                </React.Suspense>
            </BrowserRouter>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <CookieConsent
                cookieName="user.cookie.consent"
                buttonText={t('cookie-notice.dismiss')}
                style={{ background: 'var(--bg-tertiary)', boxShadow: 'var(--box-shadow)' }}
                buttonStyle={{ background: 'var(--primary-color)', color: 'white', fontSize: '13px', borderRadius: 'var(--border-radius)' }}
            >
                {t('cookie-notice.message')} <a href="https://www.cookiesandyou.com/"
                                                target="_blank" rel="noreferrer">{t('cookie-notice.link-text')}</a>
            </CookieConsent>
        </>
    );
}

export default App;
