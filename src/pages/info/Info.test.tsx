import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';

vi.mock('../../lib/api/servers', () => ({
  getServerInfoAPI: vi.fn(),
  getServerGraphAPI: vi.fn(),
  getServerInsightsAPI: vi.fn(),
}));

// The chart needs a real layout to measure, and these tests are about what the page asks for.
vi.mock('../../components/server/ServerTrendChart', () => ({
  ServerTrendChart: () => <div data-testid="trend-chart" />,
}));

import Info from './Info';
import { getServerGraphAPI, getServerInfoAPI, getServerInsightsAPI } from '../../lib/api/servers';
import { apiResponse } from '../../testUtils';
import type { ServerSummary } from '../../types/api';

const server: ServerSummary = {
  accountId: 1,
  serverId: 7,
  ip: '203.0.113.7',
  port: 7777,
  online: true,
  version: '14.2.0',
  friendlyFire: false,
  modded: false,
  whitelist: false,
  isoCode: 'KR',
  players: '5/30',
  info: 'Site-19 Mirror',
  techList: [],
  pastebin: '',
  official: 0,
  distance: 10,
  lastSeen: null,
};

function renderInfo(id = '7') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/servers/${id}`]}>
        <Routes>
          <Route path="/servers/:serverId" element={<Info />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('Info page graph', () => {
  beforeEach(() => {
    vi.mocked(getServerGraphAPI).mockReset().mockResolvedValue(apiResponse<string>(''));
    vi.mocked(getServerInsightsAPI).mockReset().mockResolvedValue(apiResponse({ serverId: 7, generatedAt: '', history: null, heatmap: null }));
  });

  it('starts an online server on the last week in 5 minute steps', async () => {
    vi.mocked(getServerInfoAPI).mockResolvedValue(apiResponse<ServerSummary>(server));
    renderInfo();

    await waitFor(() => expect(getServerGraphAPI).toHaveBeenCalledTimes(1));
    expect(getServerGraphAPI).toHaveBeenCalledWith('7', { aggregateEvery: '5m', startTime: '-604800s' });
    expect(await screen.findByText('1 week')).toBeInTheDocument();
    expect(screen.getByText('5 minutes')).toBeInTheDocument();
  });

  it('starts an offline server on 4 years in 1 day steps', async () => {
    vi.mocked(getServerInfoAPI).mockResolvedValue(apiResponse<ServerSummary>({ ...server, online: false, lastSeen: '2026-09-24T06:12:00Z' }));
    renderInfo();

    await waitFor(() => expect(getServerGraphAPI).toHaveBeenCalledTimes(1));
    expect(getServerGraphAPI).toHaveBeenCalledWith('7', { aggregateEvery: '1d', startTime: `-${4 * 365 * 86_400}s` });
    expect(await screen.findByText('4 years')).toBeInTheDocument();
    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('loads one graph when the same server is opened again', async () => {
    vi.mocked(getServerInfoAPI).mockResolvedValue(apiResponse<ServerSummary>(server));
    const first = renderInfo();
    await waitFor(() => expect(getServerGraphAPI).toHaveBeenCalledTimes(1));
    first.unmount();

    vi.mocked(getServerGraphAPI).mockClear();
    renderInfo();

    expect(await screen.findByText('1 week')).toBeInTheDocument();
    expect(getServerGraphAPI).toHaveBeenCalledTimes(1);
  });

  it('asks for no graph when the server does not exist', async () => {
    vi.mocked(getServerInfoAPI).mockResolvedValue(apiResponse<ServerSummary | null>(null));
    renderInfo();

    expect(await screen.findByText('Server not found.')).toBeInTheDocument();
    expect(getServerGraphAPI).not.toHaveBeenCalled();
  });
});
