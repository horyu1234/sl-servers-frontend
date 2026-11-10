import React from 'react';
import {createRoot} from "react-dom/client";
import './components/consent/sentryGate';
import './components/consent/gtmGate';
import './components/consent/clarityGate';
import './components/consent/mineTalkGate';
import App from './components/App';
import {preloadPage} from './components/pages';
import {Provider} from "react-redux";
import store from "./store";
import reportWebVitals from './reportWebVitals';
import {NoticeProvider} from "./components/notice/NoticeContext";
import NoticeBanner from "./components/shell/NoticeBanner";
import AnalyticsRevokeNotice from './components/consent/AnalyticsRevokeNotice';
import {Toaster} from "./components/ui/sonner";
import "./i18n/i18n";

import '@fontsource-variable/inter';
import './styles/globals.css';

// index.html always has #root.
const root = createRoot(document.getElementById('root')!);

// #root may hold the page as the edge function wrote it. It stays on screen until the code of
// this page has loaded, and React replaces it on the first render.
preloadPage(window.location.pathname).then(() => {
    root.render(
        <React.StrictMode>
            <NoticeProvider>
                <NoticeBanner/>
                <AnalyticsRevokeNotice/>
                <Provider store={store}>
                    <App/>
                </Provider>
            </NoticeProvider>
            <Toaster richColors closeButton position="top-right" theme="dark"/>
        </React.StrictMode>
    );
});

reportWebVitals();
