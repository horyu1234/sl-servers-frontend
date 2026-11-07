import { describe, it, expect, vi } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('axios', () => ({
  default: { create: () => ({ get }) },
}));

import { getServersTrendsAPI } from './trends';

describe('getServersTrendsAPI', () => {
  it('requests seven days of hourly points by default', () => {
    getServersTrendsAPI();

    expect(get).toHaveBeenCalledWith('/v2/servers/trends', { params: { window: '7d', resolution: '1h' } });
  });
});
