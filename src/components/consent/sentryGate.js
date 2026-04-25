import * as Sentry from '@sentry/react';
import { readConsent, subscribe } from './silktideClient';

let started = false;

function initSentry() {
  Sentry.init({
    dsn: 'https://273bce475a7d46cdb126ba29bd99f867@o508489.ingest.sentry.io/4505483920998400',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracePropagationTargets: [/^https:\/\/backend\.scplist\.kr\/api/],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  started = true;
}

function shutdownSentry() {
  Sentry.getClient()?.close();
  started = false;
}

function evaluate() {
  const { granted } = readConsent('analytics');
  if (granted && !started) initSentry();
  else if (!granted && started) shutdownSentry();
}

// Evaluate at import time in case consent was already granted on a prior visit.
evaluate();
subscribe(evaluate);
