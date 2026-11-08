import { readConsent, subscribe } from './silktideClient';

const CONTAINER_ID = 'GTM-KC5HBS5T';
let initialized = false;

export function isInitialized() {
  return initialized;
}

function initGtm() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${CONTAINER_ID}`;
  document.head.appendChild(script);

  initialized = true;
}

function evaluate() {
  if (!initialized && readConsent('analytics').granted) {
    initGtm();
  }
}

try {
  evaluate();
  subscribe(evaluate);
} catch (e) {
  // Observability gate failed; the app must still boot.
  // eslint-disable-next-line no-console
  console.warn('[gtmGate] failed to initialise consent gate:', e);
}
