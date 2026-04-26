import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';
const GTM_SRC_PREFIX = 'https://www.googletagmanager.com/gtm.js?id=GTM-KC5HBS5T';

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function gtmScripts() {
  return Array.from(document.querySelectorAll('script')).filter(
    (s) => s.src && s.src.startsWith(GTM_SRC_PREFIX)
  );
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

describe('gtmGate', () => {
  beforeEach(() => {
    for (const [type, set] of Object.entries(trackedHandlers)) {
      for (const h of set) window.removeEventListener(type, h);
      set.clear();
    }
    for (const s of gtmScripts()) s.remove();
    delete window.dataLayer;
    localStorage.clear();
    vi.resetModules();
  });

  it('does not inject the GTM script when consent is unknown', async () => {
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });

  it('does not inject the GTM script when consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(0);
  });

  it('injects the GTM script exactly once when consent is granted at import', async () => {
    localStorage.setItem(KEY, 'true');
    const mod = await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(1);
    expect(window.dataLayer).toEqual([
      expect.objectContaining({ 'gtm.start': expect.any(Number), event: 'gtm.js' }),
    ]);
    expect(mod.isInitialized()).toBe(true);
  });

  it('injects the GTM script when consent transitions denied -> granted', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(0);
    setConsent(true);
    expect(gtmScripts()).toHaveLength(1);
  });

  it('does not inject twice when consent toggles granted -> denied -> granted (lock-once)', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./gtmGate');
    expect(gtmScripts()).toHaveLength(1);
    setConsent(false);
    setConsent(true);
    expect(gtmScripts()).toHaveLength(1);
  });

  it('uses async script loading so it does not block render', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./gtmGate');
    expect(gtmScripts()[0].async).toBe(true);
  });
});
