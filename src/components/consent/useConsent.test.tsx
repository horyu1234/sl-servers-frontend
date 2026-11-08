import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConsent } from './useConsent';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';

describe('useConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns "unknown" before the user makes a choice', () => {
    const { result } = renderHook(() => useConsent('analytics'));
    expect(result.current).toEqual({ granted: false, status: 'unknown' });
  });

  it('reflects the current localStorage state on mount', () => {
    localStorage.setItem(KEY, 'true');
    const { result } = renderHook(() => useConsent('analytics'));
    expect(result.current).toEqual({ granted: true, status: 'granted' });
  });

  it('updates when the silktide:consentchange event fires', () => {
    const { result } = renderHook(() => useConsent('analytics'));
    act(() => {
      localStorage.setItem(KEY, 'true');
      window.dispatchEvent(new Event(CHANGE_EVENT));
    });
    expect(result.current).toEqual({ granted: true, status: 'granted' });
  });
});
