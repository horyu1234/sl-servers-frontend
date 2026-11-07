import { describe, it, expect } from 'vitest';
import serverList from './serverList';

const loaded = {
  fetching: false,
  error: null,
  data: { servers: [{ serverId: 1 }] },
};

describe('serverList reducer', () => {
  it('keeps the current rows on screen while refetching', () => {
    const next = serverList(loaded, { type: 'SERVER_LIST_FETCHING' });
    expect(next.fetching).toBe(true);
    expect(next.data.servers).toEqual([{ serverId: 1 }]);
  });

  it('clears the rows when the refetch fails', () => {
    const next = serverList(loaded, { type: 'SERVER_LIST_FAILURE', payload: { message: 'x' } });
    expect(next.data.servers).toEqual([]);
    expect(next.error).toEqual({ message: 'x' });
  });
});
