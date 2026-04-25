import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConsent } from './useConsent';

const STORAGE_KEY = 'silktideCookieChoices';

describe('useConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "unknown" before the user makes a choice', () => {
    const { result } = renderHook(() => useConsent('analytics'));
    expect(result.current).toEqual({ granted: false, status: 'unknown' });
  });

  it('reflects the current localStorage state on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, functional: true, advertising: false, necessary: true }));
    const { result } = renderHook(() => useConsent('analytics'));
    expect(result.current).toEqual({ granted: true, status: 'granted' });
  });

  it('updates when the storage event fires', () => {
    const { result } = renderHook(() => useConsent('analytics'));
    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, functional: true, advertising: false, necessary: true }));
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    });
    expect(result.current).toEqual({ granted: true, status: 'granted' });
  });
});
