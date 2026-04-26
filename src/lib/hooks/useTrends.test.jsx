import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTrends, _resetCacheForTests } from './useTrends';

vi.mock('../api/trends', () => ({
  getServersTrendsAPI: vi.fn(),
}));
import { getServersTrendsAPI } from '../api/trends';

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
    getServersTrendsAPI.mockReset();
    _resetCacheForTests();
  });

  it('initially returns { trends: null, error: null, loading: true }', () => {
    getServersTrendsAPI.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useTrends());
    expect(result.current).toEqual({ trends: null, error: null, loading: true });
  });

  it('resolves to the trends map on success', async () => {
    getServersTrendsAPI.mockResolvedValue(sampleResponse);
    const { result } = renderHook(() => useTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.trends).toEqual(sampleResponse.data.trends);
    expect(result.current.error).toBeNull();
  });

  it('reports error on rejection', async () => {
    getServersTrendsAPI.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useTrends());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.trends).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('serves cache on subsequent mounts within TTL', async () => {
    getServersTrendsAPI.mockResolvedValue(sampleResponse);
    const first = renderHook(() => useTrends());
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    expect(getServersTrendsAPI).toHaveBeenCalledTimes(1);

    first.unmount();

    const second = renderHook(() => useTrends());
    expect(second.result.current.trends).toEqual(sampleResponse.data.trends);
    expect(getServersTrendsAPI).toHaveBeenCalledTimes(1); // cache hit
  });
});
