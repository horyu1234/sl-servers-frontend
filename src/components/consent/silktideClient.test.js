import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readConsent, subscribe, CATEGORIES } from './silktideClient';

const KEY = (id) => `silktideCookieChoice_${id}`;
const CHANGE_EVENT = 'silktide:consentchange';

describe('silktideClient.readConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "unknown" when nothing has been written yet', () => {
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'unknown' });
  });

  it('returns "granted" when the per-type key is "true"', () => {
    localStorage.setItem(KEY('analytics'), 'true');
    expect(readConsent('analytics')).toEqual({ granted: true, status: 'granted' });
  });

  it('returns "denied" when the per-type key is "false"', () => {
    localStorage.setItem(KEY('analytics'), 'false');
    expect(readConsent('analytics')).toEqual({ granted: false, status: 'denied' });
  });

  it('exposes the three configured categories', () => {
    expect(CATEGORIES).toEqual(['necessary', 'functional', 'analytics']);
  });

  it('returns the same object reference on repeated calls with no storage change (cache contract for useSyncExternalStore)', () => {
    localStorage.setItem(KEY('analytics'), 'true');
    const first = readConsent('analytics');
    const second = readConsent('analytics');
    expect(first).toBe(second);
  });

  it('returns a fresh object reference after a storage change', () => {
    localStorage.setItem(KEY('analytics'), 'false');
    const first = readConsent('analytics');
    localStorage.setItem(KEY('analytics'), 'true');
    const second = readConsent('analytics');
    expect(first).not.toBe(second);
    expect(second).toEqual({ granted: true, status: 'granted' });
  });
});

describe('silktideClient.subscribe', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fires the callback on the silktide:consentchange custom event', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('also fires on cross-tab storage events', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    window.dispatchEvent(new StorageEvent('storage', { key: KEY('analytics') }));
    expect(cb).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('stops firing after unsubscribe', () => {
    const cb = vi.fn();
    const unsubscribe = subscribe(cb);
    unsubscribe();
    window.dispatchEvent(new Event(CHANGE_EVENT));
    expect(cb).not.toHaveBeenCalled();
  });
});
