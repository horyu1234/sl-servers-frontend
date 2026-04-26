import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let listeners;
  let currentMatches;

  beforeEach(() => {
    listeners = new Set();
    currentMatches = false;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      media: query,
      get matches() { return currentMatches; },
      addEventListener: (_, cb) => listeners.add(cb),
      removeEventListener: (_, cb) => listeners.delete(cb),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the initial matchMedia value synchronously', () => {
    currentMatches = true;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(true);
  });

  it('updates when matchMedia fires a change event', () => {
    currentMatches = false;
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      for (const cb of listeners) cb({ matches: true });
    });
    expect(result.current).toBe(true);
  });

  it('removes its listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(listeners.size).toBe(1);
    unmount();
    expect(listeners.size).toBe(0);
  });
});
