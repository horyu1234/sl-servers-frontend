import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';
const CLARITY_SRC = 'https://www.clarity.ms/tag/whmgvzi2gl';

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function clarityScripts() {
  return Array.from(document.querySelectorAll('script')).filter(
    (s) => s.src === CLARITY_SRC
  );
}

const trackedHandlers = { storage: new Set(), [CHANGE_EVENT]: new Set() };
const origAdd = window.addEventListener.bind(window);
window.addEventListener = function (type, handler, ...rest) {
  if (trackedHandlers[type]) trackedHandlers[type].add(handler);
  return origAdd(type, handler, ...rest);
};

describe('clarityGate', () => {
  beforeEach(() => {
    for (const [type, set] of Object.entries(trackedHandlers)) {
      for (const h of set) window.removeEventListener(type, h);
      set.clear();
    }
    for (const s of clarityScripts()) s.remove();
    delete window.clarity;
    localStorage.clear();
    vi.resetModules();
  });

  it('does not inject the Clarity script when consent is unknown', async () => {
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(0);
    expect(window.clarity).toBeUndefined();
  });

  it('does not inject the Clarity script when consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(0);
  });

  it('injects the Clarity script exactly once when consent is granted at import', async () => {
    localStorage.setItem(KEY, 'true');
    const mod = await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(1);
    expect(typeof window.clarity).toBe('function');
    expect(Array.isArray(window.clarity.q)).toBe(true);
    expect(mod.isInitialized()).toBe(true);
  });

  it('queues calls made before the remote script finishes loading', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./clarityGate');
    window.clarity('event', 'manual-test');
    expect(window.clarity.q).toHaveLength(1);
    expect(Array.from(window.clarity.q[0])).toEqual(['event', 'manual-test']);
  });

  it('injects the Clarity script when consent transitions denied -> granted', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(0);
    setConsent(true);
    expect(clarityScripts()).toHaveLength(1);
  });

  it('does not inject twice when consent toggles granted -> denied -> granted (lock-once)', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./clarityGate');
    expect(clarityScripts()).toHaveLength(1);
    setConsent(false);
    setConsent(true);
    expect(clarityScripts()).toHaveLength(1);
  });

  it('uses async script loading so it does not block render', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./clarityGate');
    expect(clarityScripts()[0].async).toBe(true);
  });
});
