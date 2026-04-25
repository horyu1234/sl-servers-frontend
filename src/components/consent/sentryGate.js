import * as Sentry from '@sentry/react';
import { readConsent, subscribe } from './silktideClient';

// Once Sentry has been initialised in this page session, we never re-init.
// Sentry's `close()` flushes the buffer and disables the client but does
// NOT remove the global listeners installed by browserTracingIntegration
// (fetch/history patches) or replayIntegration (DOM listeners,
// PerformanceObserver). Re-running Sentry.init would install a second set
// of those listeners on top of the first set, producing double-instrumented
// network calls and duplicate breadcrumbs. Locking after first init avoids
// that. The cost is that a user who revokes and then re-grants Analytics
// consent in the same session will not get observability back until they
// reload the page — acceptable tradeoff.
let initialized = false;
let running = false;

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
  initialized = true;
  running = true;
}

function evaluate() {
  const { granted } = readConsent('analytics');
  if (granted && !initialized) {
    initSentry();
  } else if (!granted && running) {
    // Flush + disable the client. Integrations stay in place but no events
    // are sent. Re-grant in the same page session is a no-op (see comment
    // above the `initialized` declaration).
    Sentry.close();
    running = false;
  }
}

// Run once at import time in case consent was already granted on a prior
// visit. Wrap in try/catch because some environments (Safari private mode,
// locked-down browsers) can throw on the first localStorage access.
try {
  evaluate();
  subscribe(evaluate);
} catch (e) {
  // Observability gate failed; the app must still boot.
  // eslint-disable-next-line no-console
  console.warn('[sentryGate] failed to initialise consent gate:', e);
}
