import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';

vi.mock('../../lib/api/servers', () => ({
  getServerListAPI: vi.fn().mockResolvedValue({
    data: {
      onlineServerCount: 1, onlineUserCount: 22,
      displayServerCount: 1, displayUserCount: 22, offlineServerCount: 0,
      servers: [{
        serverId: 1, isoCode: 'KR', ip: '1.2.3.4', port: 7777,
        version: '14.2.6', friendlyFire: false, whitelist: false, modded: false,
        players: '22/30', info: 'Site-19 Mirror', techList: [], distance: 100,
      }],
    },
  }),
}));

vi.mock('../../lib/api/countries', () => ({
  getCountryListAPI: vi.fn().mockResolvedValue({ data: ['KR'] }),
}));

vi.mock('../../lib/api/trends', () => ({
  getServersTrendsAPI: vi.fn().mockResolvedValue({
    data: { window: '24h', resolution: '1h', bucketCount: 24, endTime: 'x', serverIds: ['1'], trends: { '1': new Array(24).fill(10) } },
  }),
}));

import List from './List';
import { getServerListAPI } from '../../lib/api/servers';

function LocationProbe() {
  const { search } = useLocation();
  return <output data-testid="location">{search}</output>;
}

describe('List page', () => {
  it('requests the chosen sort and stays in the current view', async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/?view=grid']}>
          <List />
          <LocationProbe />
        </MemoryRouter>
      </Provider>
    );

    await user.click(await screen.findByRole('radio', { name: 'Most players' }));

    await waitFor(() => expect(getServerListAPI).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'PLAYERS_DESC' })
    ));
    const params = new URLSearchParams(screen.getByTestId('location').textContent);
    expect(params.get('sort')).toBe('PLAYERS_DESC');
    expect(params.get('view')).toBe('grid');
  });

  it('offers to clear the filters when nothing matches', async () => {
    getServerListAPI.mockResolvedValueOnce({
      data: {
        onlineServerCount: 1, onlineUserCount: 22,
        displayServerCount: 0, displayUserCount: 0, offlineServerCount: 0,
        servers: [],
      },
    });
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/?search=nothing']}>
          <List />
          <LocationProbe />
        </MemoryRouter>
      </Provider>
    );

    expect(await screen.findByText('No servers match your filters')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Clear all' }).at(-1));

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(''));
  });

  it('fetches and renders the server row', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <List />
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => expect(screen.getByText(/Site-19 Mirror/)).toBeInTheDocument());
  });
});
