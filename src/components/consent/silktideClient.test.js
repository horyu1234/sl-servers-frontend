import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readConsent, subscribe, CATEGORIES } from './silktideClient';

const STORAGE_KEY = 'silktideCookieChoices';

describe('silktideClient.readConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "unknown" when nothing has been written yet', () => {
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'unknown' });
  });

  it('returns "granted" when the category is true in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, advertising: false, functional: true, necessary: true }));
    expect(readConsent('analytics')).toEqual({ granted: true, status: 'granted' });
  });

  it('returns "denied" when the category is false in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, advertising: false, functional: true, necessary: true }));
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'denied' });
  });

  it('treats a malformed JSON value as "unknown"', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{');
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'unknown' });
  });

  it('exposes the four standard categories', () => {
    expect(CATEGORIES).toEqual(['necessary', 'functional', 'analytics', 'advertising']);
  });

  it('returns the same object reference on repeated calls with no storage change (cache contract for useSyncExternalStore)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, functional: true, advertising: false, necessary: true }));
    const first = readConsent('analytics');
    const second = readConsent('analytics');
    expect(first).toBe(second);
  });

  it('returns a fresh object reference after a storage change', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, functional: true, advertising: false, necessary: true }));
    const first = readConsent('analytics');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, functional: true, advertising: false, necessary: true }));
    const second = readConsent('analytics');
    expect(first).not.toBe(second);
    expect(second).toEqual({ granted: true, status: 'granted' });
  });
});

describe('silktideClient.subscribe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fires the callback when the storage key changes', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops firing after unsubscribe', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    unsubscribe();
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    expect(cb).not.toHaveBeenCalled();
  });

  it('ignores storage events for unrelated keys', () => {
    const cb = vi.fn();
    subscribe(cb);
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
    expect(cb).not.toHaveBeenCalled();
  });
});
