import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTrends, _resetCacheForTests } from './useTrends';

vi.mock('../api/trends', () => ({
  getServersTrendsBatchAPI: vi.fn(),
}));
import { getServersTrendsBatchAPI } from '../api/trends';

const trendsFor = (ids) => Object.fromEntries(ids.map((id) => [String(id), new Array(24).fill(id)]));

const makeResponse = (ids) => ({
  data: { window: '24h', resolution: '1h', bucketCount: 24, endTime: 'x', serverIds: ids.map(String), trends: trendsFor(ids) },
});

describe('useTrends (visibility-driven, debounced, per-id cache)', () => {
  beforeEach(() => {
    getServersTrendsBatchAPI.mockReset();
    _resetCacheForTests();
    vi.useFakeTimers();
  });

  it('returns { trends: null, loading: false } for an empty visibleIds (no fetch)', () => {
    const { result } = renderHook(() => useTrends([]));
    expect(result.current.loading).toBe(false);
    expect(result.current.trends).toBeNull();
    expect(getServersTrendsBatchAPI).not.toHaveBeenCalled();
  });

  it('does not fetch immediately — debounces by 200ms', async () => {
    getServersTrendsBatchAPI.mockResolvedValue(makeResponse([1, 2]));
    renderHook(() => useTrends([1, 2]));
    expect(getServersTrendsBatchAPI).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(199); });
    expect(getServersTrendsBatchAPI).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(2); });
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1);
    expect(getServersTrendsBatchAPI).toHaveBeenCalledWith({ serverIds: [1, 2] });
  });

  it('coalesces rapid scroll changes — fires once for the final viewport', async () => {
    getServersTrendsBatchAPI.mockResolvedValue(makeResponse([5, 6]));
    const { rerender } = renderHook(({ ids }) => useTrends(ids), { initialProps: { ids: [1, 2] } });
    rerender({ ids: [3, 4] });
    rerender({ ids: [5, 6] });
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1);
    expect(getServersTrendsBatchAPI).toHaveBeenLastCalledWith({ serverIds: [5, 6] });
  });

  it('after first fetch, scrolling to overlapping ids only requests the missing ones', async () => {
    // First viewport [1, 2] -> fetched.
    getServersTrendsBatchAPI.mockResolvedValueOnce(makeResponse([1, 2]));
    const { rerender } = renderHook(({ ids }) => useTrends(ids), { initialProps: { ids: [1, 2] } });
    await act(async () => { vi.advanceTimersByTime(250); });
    await act(async () => {}); // flush the resolved-promise microtask + bump

    // Scroll: viewport [2, 3] -> only id 3 is missing (id 2 cached).
    getServersTrendsBatchAPI.mockResolvedValueOnce(makeResponse([3]));
    rerender({ ids: [2, 3] });
    await act(async () => { vi.advanceTimersByTime(250); });
    await act(async () => {});
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(2);
    expect(getServersTrendsBatchAPI).toHaveBeenLastCalledWith({ serverIds: [3] });
  });

  it('scrolling back to already-cached ids does NOT refetch', async () => {
    getServersTrendsBatchAPI.mockResolvedValueOnce(makeResponse([1, 2]));
    const { rerender } = renderHook(({ ids }) => useTrends(ids), { initialProps: { ids: [1, 2] } });
    await act(async () => { vi.advanceTimersByTime(250); });

    rerender({ ids: [3, 4] });
    getServersTrendsBatchAPI.mockResolvedValueOnce(makeResponse([3, 4]));
    await act(async () => { vi.advanceTimersByTime(250); });

    rerender({ ids: [1, 2] });
    await act(async () => { vi.advanceTimersByTime(250); });

    // 2 calls total — first for [1,2], second for [3,4]. Going back to
    // [1,2] is a cache hit.
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(2);
  });

  it('cache key is order-independent — [2,1] hits the same as [1,2]', async () => {
    getServersTrendsBatchAPI.mockResolvedValueOnce(makeResponse([1, 2]));
    const first = renderHook(() => useTrends([1, 2]));
    await act(async () => { vi.advanceTimersByTime(250); });
    first.unmount();

    const second = renderHook(() => useTrends([2, 1]));
    await act(async () => { vi.advanceTimersByTime(250); });
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1);
    expect(second.result.current.trends?.['1']).toBeTruthy();
    expect(second.result.current.trends?.['2']).toBeTruthy();
  });
});
