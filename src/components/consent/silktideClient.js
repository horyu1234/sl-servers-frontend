// Per-type localStorage keys written by silktide-consent-manager.js
// (`silktideCookieChoice_<typeId>` = "true" | "false"). The script never
// dispatches a DOM event on its own — index.html wires per-type
// onAccept/onReject callbacks to fire `silktide:consentchange`, which
// useSyncExternalStore subscribes to here.
const KEY_PREFIX = 'silktideCookieChoice_';
const CHANGE_EVENT = 'silktide:consentchange';

export const CATEGORIES = ['necessary', 'functional', 'analytics'];

// Cache per category so useSyncExternalStore gets a stable object reference
// when the underlying data has not changed (avoids infinite-loop re-renders).
const consentCache = new Map();

export function readConsent(category) {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY_PREFIX + category);
  } catch {
    // Safari private mode etc — treat as unknown.
  }
  let next;
  if (raw === 'true') next = { granted: true, status: 'granted' };
  else if (raw === 'false') next = { granted: false, status: 'denied' };
  else next = { granted: false, status: 'unknown' };

  const cached = consentCache.get(category);
  if (cached && cached.granted === next.granted && cached.status === next.status) {
    return cached;
  }
  consentCache.set(category, next);
  return next;
}

const listeners = new Set();
let installed = false;

function handleChange() {
  for (const cb of listeners) cb();
}

export function subscribe(callback) {
  if (!installed) {
    window.addEventListener(CHANGE_EVENT, handleChange);
    // Cross-tab updates still arrive via the storage event.
    window.addEventListener('storage', handleChange);
    installed = true;
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener(CHANGE_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
      installed = false;
    }
  };
}
