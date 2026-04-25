import React from 'react';
import {createRoot} from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from './components/App';
import {Provider} from "react-redux";
import store from "./store";
import reportWebVitals from './reportWebVitals';
import {NoticeProvider} from "./components/notice/NoticeContext";
import NoticeBanner from "./components/notice/NoticeBanner";
import "./i18n/i18n";

import 'bootswatch/dist/darkly/bootstrap.min.css';
import './index.css';
import './styles/global.css';

Sentry.init({
    dsn: "https://273bce475a7d46cdb126ba29bd99f867@o508489.ingest.sentry.io/4505483920998400",
    integrations: [
        new Sentry.BrowserTracing({
            // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
            tracePropagationTargets: [/^https:\/\/backend\.scplist\.kr\/api/],
        }),
        new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <NoticeProvider>
            <NoticeBanner/>
            <Provider store={store}>
                <App/>
            </Provider>
        </NoticeProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
