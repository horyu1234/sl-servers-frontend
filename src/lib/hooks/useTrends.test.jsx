import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTrends, _resetCacheForTests } from './useTrends';

vi.mock('../api/trends', () => ({
  getServersTrendsAPI: vi.fn(),
}));
import { getServersTrendsAPI } from '../api/trends';

const allTrends = (ids) => Object.fromEntries(ids.map((id) => [String(id), new Array(24).fill(id)]));

const makeResponse = (ids) => ({
  data: { window: '24h', resolution: '1h', bucketCount: 24, endTime: 'x', serverIds: ids.map(String), trends: allTrends(ids) },
});

describe('useTrends (single GET, module-level cache)', () => {
  beforeEach(() => {
    getServersTrendsAPI.mockReset();
    _resetCacheForTests();
  });

  it('fetches once on first mount and exposes the trends map', async () => {
    getServersTrendsAPI.mockResolvedValue(makeResponse([1, 2, 3]));
    const { result } = renderHook(() => useTrends());
    expect(getServersTrendsAPI).toHaveBeenCalledTimes(1);
    await act(async () => {}); // flush resolved promise + bump
    expect(result.current.trends?.['1']).toBeTruthy();
    expect(result.current.trends?.['3']).toBeTruthy();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not refetch on subsequent mounts within the TTL window', async () => {
    getServersTrendsAPI.mockResolvedValue(makeResponse([1, 2]));
    const first = renderHook(() => useTrends());
    await act(async () => {});
    first.unmount();

    const second = renderHook(() => useTrends());
    await act(async () => {});
    expect(getServersTrendsAPI).toHaveBeenCalledTimes(1);
    expect(second.result.current.trends?.['1']).toBeTruthy();
  });

  it('coalesces concurrent first-mounts into a single request', async () => {
    getServersTrendsAPI.mockResolvedValue(makeResponse([1]));
    renderHook(() => useTrends());
    renderHook(() => useTrends());
    renderHook(() => useTrends());
    await act(async () => {});
    expect(getServersTrendsAPI).toHaveBeenCalledTimes(1);
  });

  it('surfaces network errors via the error field', async () => {
    const err = new Error('boom');
    getServersTrendsAPI.mockRejectedValueOnce(err);
    const { result } = renderHook(() => useTrends());
    await act(async () => {});
    expect(result.current.error).toBe(err);
    expect(result.current.trends).toEqual({});
  });
});
