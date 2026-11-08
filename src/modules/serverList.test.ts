import { describe, it, expect } from 'vitest';
import serverList from './serverList';
import type { ServerListError, ServerListState } from './serverList';
import type { ServerSummary } from '../types/api';

const loaded: ServerListState = {
  fetching: false,
  error: null,
  data: {
    onlineUserCount: 0,
    onlineServerCount: 1,
    displayUserCount: 0,
    displayServerCount: 1,
    offlineServerCount: 0,
    servers: [{ serverId: 1 } as ServerSummary],
  },
};

describe('serverList reducer', () => {
  it('keeps the current rows on screen while refetching', () => {
    const next = serverList(loaded, { type: 'SERVER_LIST_FETCHING' });
    expect(next.fetching).toBe(true);
    expect(next.data.servers).toEqual([{ serverId: 1 }]);
  });

  it('clears the rows when the refetch fails', () => {
    const next = serverList(loaded, { type: 'SERVER_LIST_FAILURE', payload: { message: 'x' } as ServerListError });
    expect(next.data.servers).toEqual([]);
    expect(next.error).toEqual({ message: 'x' });
  });
});
