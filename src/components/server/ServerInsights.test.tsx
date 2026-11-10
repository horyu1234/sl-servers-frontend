import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../i18n/locale/en-US.json';
import { ServerInsights } from './ServerInsights';
import { getServerInsightsAPI } from '../../lib/api/servers';
import { apiResponse } from '../../testUtils';
import type { AxiosResponse } from 'axios';
import { insights, server } from '../../site/pages/testData';
import type { ServerInsightsResponse } from '../../types/api';

vi.mock('../../lib/api/servers', () => ({ getServerInsightsAPI: vi.fn() }));

const history = {
  firstSeenDate: '2023-10-24',
  lastSeenDate: '2026-11-07',
  trackedSinceCollectionStart: false,
  peakPlayers: 107,
  peakDate: '2024-05-15',
  versionCount: 25,
  olderThanOnlinePercent: 85,
};

function heatmap() {
  const medians: (number | null)[] = Array.from({ length: 168 }, () => 4);
  const fullRates: (number | null)[] = Array.from({ length: 168 }, () => 0);
  // Friday 12:00 UTC is 21:00 for a viewer at UTC+9.
  medians[4 * 24 + 12] = 30;
  fullRates[4 * 24 + 12] = 0.62;
  return { weeks: 8, medians, fullRates, capacity: 30 };
}

function respondWith(data: unknown) {
  vi.mocked(getServerInsightsAPI).mockResolvedValue(apiResponse(data));
}

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en-US',
    resources: { 'en-US': { translation: en } },
    interpolation: { escapeValue: false },
  });
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-06T12:30:00Z'));
  vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-540);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.mocked(getServerInsightsAPI).mockReset();
});

describe('ServerInsights', () => {
  it('shows the server record', async () => {
    respondWith({ history, heatmap: null });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    expect(await screen.findByText('3y 0mo')).toBeInTheDocument();
    expect(screen.getByText('First seen 2023-10-24')).toBeInTheDocument();
    expect(screen.getByText('107 players')).toBeInTheDocument();
    expect(screen.getByText('2024-05-15')).toBeInTheDocument();
    expect(screen.getByText('25 versions')).toBeInTheDocument();
    expect(screen.getByText('Oldest 15%')).toBeInTheDocument();
  });

  it('does not claim a start date for a server older than the records', async () => {
    respondWith({
      history: { ...history, firstSeenDate: '2020-09-17', trackedSinceCollectionStart: true },
      heatmap: null,
    });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    expect(await screen.findByText('Since before our records began (2020-09-17)')).toBeInTheDocument();
  });

  it('leaves out the online comparison for an offline server', async () => {
    respondWith({ history: { ...history, olderThanOnlinePercent: null }, heatmap: null });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    await screen.findByText('25 versions');
    expect(screen.queryByText('Age rank')).not.toBeInTheDocument();
  });

  it('answers the current hour in the viewer time zone', async () => {
    respondWith({ history, heatmap: heatmap() });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    expect(await screen.findByText(/Right now \(Fri 21:00\): usually 30 players/)).toBeInTheDocument();
    expect(screen.getByText(/full 62% of the time/)).toBeInTheDocument();
    expect(screen.getByText(/UTC\+9/)).toBeInTheDocument();
  });

  it('marks hours that are often full without relying on color', async () => {
    respondWith({ history, heatmap: heatmap() });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    await screen.findByText(/Right now/);
    expect(screen.getAllByTestId('often-full')).toHaveLength(1);
  });

  it('lets a keyboard user read other hours', async () => {
    respondWith({ history, heatmap: heatmap() });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    const grid = await screen.findByRole('group', { name: 'When is it busy?' });
    fireEvent.keyDown(grid, { key: 'ArrowRight' });

    expect(screen.getByText('Fri 22:00: usually 4 players')).toBeInTheDocument();

    fireEvent.blur(grid);
    expect(screen.getByText(/Right now/)).toBeInTheDocument();
  });

  it('says so when an hour has too few samples', async () => {
    const sparse = heatmap();
    sparse.medians[4 * 24 + 12] = null;
    sparse.fullRates[4 * 24 + 12] = null;
    respondWith({ history, heatmap: sparse });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    expect(await screen.findByText('Fri 21:00: not enough data')).toBeInTheDocument();
  });

  it('skips the full marker and legend when capacity is unknown', async () => {
    respondWith({ history, heatmap: { ...heatmap(), fullRates: null, capacity: null } });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    await screen.findByText(/Right now/);
    expect(screen.queryByTestId('often-full')).not.toBeInTheDocument();
    expect(screen.queryByText(/Often full/)).not.toBeInTheDocument();
  });

  it('says when a server is simply empty', async () => {
    respondWith({ history, heatmap: { weeks: 8, medians: Array(168).fill(0), fullRates: null, capacity: null } });
    render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    expect(await screen.findByText('This server has been mostly empty for the last 8 weeks.')).toBeInTheDocument();
  });

  it('steps aside when the API is not deployed or fails', async () => {
    vi.mocked(getServerInsightsAPI).mockRejectedValue(new Error('404'));
    const { container } = render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('renders nothing when there is no data for the server', async () => {
    respondWith({ history: null, heatmap: null });
    const { container } = render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('describes the server in words and shows its rank when it is given the server', async () => {
    respondWith(insights);
    render(<ServerInsights serverId="7" server={server} />, { wrapper: MemoryRouter });

    expect(await screen.findByText('About this server')).toBeInTheDocument();
    expect(screen.getByText(/is a modded SCP: Secret Laboratory server hosted in South Korea/)).toBeInTheDocument();
    expect(screen.getByText(/That ranks #12 of the 1,100 servers online worldwide/)).toBeInTheDocument();
    expect(screen.getByText('World rank')).toBeInTheDocument();
    expect(screen.getByText('#12')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Neighbour server' })).toHaveAttribute('href', '/servers/8');
  });

  it('still describes the server when the insights do not load', async () => {
    vi.mocked(getServerInsightsAPI).mockRejectedValue(new Error('down'));
    render(<ServerInsights serverId="7" server={server} />, { wrapper: MemoryRouter });

    expect(await screen.findByText('About this server')).toBeInTheDocument();
    expect(screen.getByText(/Friendly fire is on\./)).toBeInTheDocument();
    expect(screen.queryByText('World rank')).not.toBeInTheDocument();
  });

  it('shows no rank for an API that does not send one yet', async () => {
    respondWith({ history, heatmap: null });
    render(<ServerInsights serverId="7" server={server} />, { wrapper: MemoryRouter });

    expect(await screen.findByText('About this server')).toBeInTheDocument();
    expect(screen.queryByText('World rank')).not.toBeInTheDocument();
  });

  it('drops a late answer for the previous server', async () => {
    let answerFirst!: (response: AxiosResponse<ServerInsightsResponse>) => void;
    vi.mocked(getServerInsightsAPI).mockImplementationOnce(() => new Promise((resolve) => { answerFirst = resolve; }));
    vi.mocked(getServerInsightsAPI).mockResolvedValueOnce(
      apiResponse({ history: { ...history, peakPlayers: 22 }, heatmap: null }),
    );

    const { rerender } = render(<ServerInsights serverId="7" />, { wrapper: MemoryRouter });
    rerender(<ServerInsights serverId="8" />);
    await screen.findByText('22 players');

    await act(async () => {
      answerFirst(apiResponse({ history, heatmap: null }));
    });

    expect(screen.getByText('22 players')).toBeInTheDocument();
    expect(screen.queryByText('107 players')).not.toBeInTheDocument();
  });
});
