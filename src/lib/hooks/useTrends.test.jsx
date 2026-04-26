import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTrends, _resetCacheForTests } from './useTrends';

vi.mock('../api/trends', () => ({
  getServersTrendsBatchAPI: vi.fn(),
}));
import { getServersTrendsBatchAPI } from '../api/trends';

const sampleResponse = {
  data: {
    window: '24h',
    resolution: '1h',
    bucketCount: 24,
    endTime: '2026-04-25T12:00:00Z',
    serverIds: ['1', '2'],
    trends: { '1': [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,22], '2': new Array(24).fill(5) },
  },
};

describe('useTrends', () => {
  beforeEach(() => {
    getServersTrendsBatchAPI.mockReset();
    _resetCacheForTests();
  });

  it('returns { trends: null, loading: false } for an empty serverIds array (no fetch)', () => {
    const { result } = renderHook(() => useTrends([]));
    expect(result.current).toEqual({ trends: null, error: null, loading: false });
    expect(getServersTrendsBatchAPI).not.toHaveBeenCalled();
  });

  it('initially returns { trends: null, loading: true } while fetching', () => {
    getServersTrendsBatchAPI.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useTrends([1, 2]));
    expect(result.current).toEqual({ trends: null, error: null, loading: true });
  });

  it('resolves to the trends map on success', async () => {
    getServersTrendsBatchAPI.mockResolvedValue(sampleResponse);
    const { result } = renderHook(() => useTrends([1, 2]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.trends).toEqual(sampleResponse.data.trends);
    expect(result.current.error).toBeNull();
    expect(getServersTrendsBatchAPI).toHaveBeenCalledWith({ serverIds: [1, 2] });
  });

  it('reports error on rejection', async () => {
    getServersTrendsBatchAPI.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useTrends([1, 2]));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.trends).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('serves cache on subsequent mounts with the same serverIds within TTL', async () => {
    getServersTrendsBatchAPI.mockResolvedValue(sampleResponse);
    const first = renderHook(() => useTrends([1, 2]));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1);

    first.unmount();

    const second = renderHook(() => useTrends([1, 2]));
    expect(second.result.current.trends).toEqual(sampleResponse.data.trends);
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1); // cache hit
  });

  it('cache key is order-independent — [2, 1] hits the same entry as [1, 2]', async () => {
    getServersTrendsBatchAPI.mockResolvedValue(sampleResponse);
    const first = renderHook(() => useTrends([1, 2]));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    first.unmount();

    const second = renderHook(() => useTrends([2, 1]));
    expect(second.result.current.trends).toEqual(sampleResponse.data.trends);
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1);
  });

  it('refetches when serverIds change to a different set', async () => {
    getServersTrendsBatchAPI.mockResolvedValue(sampleResponse);
    const { result, rerender } = renderHook(({ ids }) => useTrends(ids), { initialProps: { ids: [1, 2] } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(1);

    rerender({ ids: [3, 4] });
    await waitFor(() => expect(getServersTrendsBatchAPI).toHaveBeenCalledTimes(2));
    expect(getServersTrendsBatchAPI).toHaveBeenLastCalledWith({ serverIds: [3, 4] });
  });
});
