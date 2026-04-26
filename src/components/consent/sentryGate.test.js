import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const initSpy = vi.fn();
const closeSpy = vi.fn();

vi.mock('@sentry/react', () => ({
  init: (...args) => initSpy(...args),
  close: (...args) => closeSpy(...args),
  browserTracingIntegration: () => ({ name: 'browserTracing' }),
  replayIntegration: () => ({ name: 'replay' }),
}));

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Track listeners added to window so we can remove stale ones between tests.
// vi.resetModules() re-imports the module but cannot remove window listeners
// registered by a previous import, leading to duplicate evaluate() calls.
const trackedHandlers = { storage: new Set(), [CHANGE_EVENT]: new Set() };
const origAdd = window.addEventListener.bind(window);
window.addEventListener = function (type, handler, ...rest) {
  if (trackedHandlers[type]) trackedHandlers[type].add(handler);
  return origAdd(type, handler, ...rest);
};

describe('sentryGate', () => {
  beforeEach(() => {
    for (const [type, set] of Object.entries(trackedHandlers)) {
      for (const h of set) window.removeEventListener(type, h);
      set.clear();
    }
    initSpy.mockClear();
    closeSpy.mockClear();
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not init Sentry when consent is unknown', async () => {
    await import('./sentryGate');
    expect(initSpy).not.toHaveBeenCalled();
  });

  it('inits Sentry exactly once when analytics consent is granted', async () => {
    await import('./sentryGate');
    setConsent(true);
    expect(initSpy).toHaveBeenCalledTimes(1);
    setConsent(true); // already granted, must not re-init
    expect(initSpy).toHaveBeenCalledTimes(1);
  });

  it('shuts Sentry down when consent is revoked after grant', async () => {
    await import('./sentryGate');
    setConsent(true);
    setConsent(false);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call close when consent was never granted', async () => {
    await import('./sentryGate');
    setConsent(false);
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('does not re-init when consent is re-granted in the same page session (locked once initialized)', async () => {
    await import('./sentryGate');
    setConsent(true);                  // grant
    expect(initSpy).toHaveBeenCalledTimes(1);
    setConsent(false);                 // revoke
    expect(closeSpy).toHaveBeenCalledTimes(1);
    setConsent(true);                  // re-grant in same session
    expect(initSpy).toHaveBeenCalledTimes(1); // still 1 — locked
  });

  it('only calls close once even on repeated revoke after grant', async () => {
    await import('./sentryGate');
    setConsent(true);
    setConsent(false);
    setConsent(false);
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes isInitialized() that flips to true after first init', async () => {
    const mod = await import('./sentryGate');
    expect(mod.isInitialized()).toBe(false);
    setConsent(true);
    expect(mod.isInitialized()).toBe(true);
    setConsent(false); // revoke must not flip back
    expect(mod.isInitialized()).toBe(true);
  });
});
