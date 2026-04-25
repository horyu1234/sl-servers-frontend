const STORAGE_KEY = 'silktideCookieChoices';

export const CATEGORIES = ['necessary', 'functional', 'analytics', 'advertising'];

function parseChoices() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Cache per category so useSyncExternalStore gets a stable object reference
// when the underlying data has not changed (avoids infinite-loop re-renders).
const consentCache = new Map();

export function readConsent(category) {
  const choices = parseChoices();
  let next;
  if (!choices || typeof choices[category] !== 'boolean') {
    next = { granted: false, status: 'unknown' };
  } else {
    next = { granted: choices[category], status: choices[category] ? 'granted' : 'denied' };
  }
  const cached = consentCache.get(category);
  if (cached && cached.granted === next.granted && cached.status === next.status) {
    return cached;
  }
  consentCache.set(category, next);
  return next;
}

const listeners = new Set();
let storageHandlerInstalled = false;

function handleStorageEvent(event) {
  if (event.key !== STORAGE_KEY) return;
  for (const cb of listeners) cb();
}

export function subscribe(callback) {
  if (!storageHandlerInstalled) {
    window.addEventListener('storage', handleStorageEvent);
    storageHandlerInstalled = true;
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorageEvent);
      storageHandlerInstalled = false;
    }
  };
}

// The DOM `storage` event only fires across tabs. Silktide writes from the
// same tab, so we additionally poll every 500ms (one cheap localStorage read).
let lastSnapshot = '';
let pollHandle = null;

export function startSameTabPolling() {
  if (pollHandle != null) return;
  lastSnapshot = localStorage.getItem(STORAGE_KEY) ?? '';
  pollHandle = setInterval(() => {
    const current = localStorage.getItem(STORAGE_KEY) ?? '';
    if (current !== lastSnapshot) {
      lastSnapshot = current;
      for (const cb of listeners) cb();
    }
  }, 500);
}

export function stopSameTabPolling() {
  if (pollHandle != null) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
}
