import { readConsent, subscribe } from './silktideClient';

const PROJECT_ID = 'whmgvzi2gl';
let initialized = false;

export function isInitialized() {
  return initialized;
}

function initClarity() {
  // Equivalent to the official Clarity bootstrap snippet, inlined so the
  // bundler/linter can see it. The queue function buffers calls made before
  // the remote tag.js finishes loading.
  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  window.clarity.q = window.clarity.q || [];

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${PROJECT_ID}`;
  const first = document.getElementsByTagName('script')[0];
  if (first && first.parentNode) {
    first.parentNode.insertBefore(script, first);
  } else {
    document.head.appendChild(script);
  }

  initialized = true;
}

function evaluate() {
  if (!initialized && readConsent('analytics').granted) {
    initClarity();
  }
}

try {
  evaluate();
  subscribe(evaluate);
} catch (e) {
  // Observability gate failed; the app must still boot.
  // eslint-disable-next-line no-console
  console.warn('[clarityGate] failed to initialise consent gate:', e);
}
