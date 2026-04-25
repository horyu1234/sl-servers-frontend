import React from 'react';
import {createRoot} from "react-dom/client";
import App from './components/App';
import {Provider} from "react-redux";
import store from "./store";
import reportWebVitals from './reportWebVitals';
import {NoticeProvider} from "./components/notice/NoticeContext";
import NoticeBanner from "./components/notice/NoticeBanner";
import {ConsentProvider} from "./components/consent/ConsentProvider";
import {Toaster} from "./components/ui/sonner";
import "./i18n/i18n";

import '@fontsource-variable/inter';
import './index.css';
import './styles/global.css';
import './styles/globals.css';

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ConsentProvider>
            <NoticeProvider>
                <NoticeBanner/>
                <Provider store={store}>
                    <App/>
                </Provider>
            </NoticeProvider>
            <Toaster richColors closeButton position="top-right" theme="dark"/>
        </ConsentProvider>
    </React.StrictMode>
);

reportWebVitals();
