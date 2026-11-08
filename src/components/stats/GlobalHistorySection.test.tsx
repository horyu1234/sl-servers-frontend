import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../i18n/locale/en-US.json';
import { GlobalHistorySection } from './GlobalHistorySection';
import { getGlobalHistoryAPI } from '../../lib/api/stats';
import { apiResponse } from '../../testUtils';

vi.mock('../../lib/api/stats', () => ({ getGlobalHistoryAPI: vi.fn() }));

const history = {
  generatedAt: '2026-11-07T10:00:00Z',
  daily: [
    { date: '2023-10-28', peak: 10208 },
    { date: '2023-10-29', peak: 11565 },
    { date: '2026-11-06', peak: 5043 },
  ],
  records: [
    { date: '2023-10-29', peak: 11565, version: '13.3.0' },
    { date: '2024-01-06', peak: 9592, version: null },
  ],
  releases: [
    { version: '13.3.0', date: '2023-10-28', major: true, peakBefore: 6624, peakAfter: 8688, changePercent: 31.2 },
    { version: '13.3.1', date: '2023-11-15', major: false, peakBefore: 7782, peakAfter: 5896, changePercent: -24.2 },
    { version: '14.2.0', date: '2025-10-24', major: true, peakBefore: null, peakAfter: null, changePercent: null },
  ],
  gaps: [{ from: '2026-03-25', to: '2026-04-12', days: 19 }, { from: '2021-08-23', to: '2021-08-29', days: 7 }],
  latest: {
    date: '2026-11-06',
    peak: 5043,
    rank: 1268,
    totalDays: 2191,
    lowerDaysPercent: 42,
    yearAgoDate: '2025-11-07',
    yearAgoPeak: 5892,
    yearAgoChangePercent: -14.4,
  },
  todayPeakSoFar: 4250,
};

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en-US',
    resources: { 'en-US': { translation: en } },
    interpolation: { escapeValue: false },
  });
});

afterEach(() => {
  vi.mocked(getGlobalHistoryAPI).mockReset();
});

describe('GlobalHistorySection', () => {
  it('places the latest finished day against the full record', async () => {
    vi.mocked(getGlobalHistoryAPI).mockResolvedValue(apiResponse(history));
    render(<GlobalHistorySection />);

    expect(await screen.findByText('SCP:SL timeline')).toBeInTheDocument();
    expect(screen.getByText('2026-11-06 (UTC)')).toBeInTheDocument();
    expect(screen.getByText('#1,268')).toBeInTheDocument();
    expect(screen.getByText('Of 2,191 days, busier than 42%')).toBeInTheDocument();
    expect(screen.getByText('-14.4%')).toBeInTheDocument();
    expect(screen.getByText('2025-11-07: 5,892 players')).toBeInTheDocument();
    expect(screen.getByText('4,250 players')).toBeInTheDocument();
    expect(screen.getByText('Still counting')).toBeInTheDocument();
  });

  it('skips the yearly comparison when that day was in an outage', async () => {
    vi.mocked(getGlobalHistoryAPI).mockResolvedValue(apiResponse({
      ...history,
      latest: { ...history.latest, yearAgoDate: null, yearAgoPeak: null, yearAgoChangePercent: null },
    }));
    render(<GlobalHistorySection />);

    await screen.findByText('SCP:SL timeline');
    expect(screen.queryByText('Vs last year')).not.toBeInTheDocument();
  });

  it('lists records and only ties them to a release when one was close', async () => {
    vi.mocked(getGlobalHistoryAPI).mockResolvedValue(apiResponse(history));
    render(<GlobalHistorySection />);

    await screen.findByText('Highest days on record');
    expect(screen.getByText('2023-10-29 · around 13.3.0')).toBeInTheDocument();
    expect(screen.getByText('2024-01-06')).toBeInTheDocument();
  });

  it('tabulates major updates, newest first, and warns against a causal reading', async () => {
    vi.mocked(getGlobalHistoryAPI).mockResolvedValue(apiResponse(history));
    render(<GlobalHistorySection />);

    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getByRole('rowheader').textContent)).toEqual(['14.2.0', '13.3.0']);
    expect(within(rows[0]).getByText('—', { selector: 'td.text-foreground' })).toBeInTheDocument();
    expect(within(rows[1]).getByText('+31.2%')).toBeInTheDocument();
    expect(screen.getByText(/not the effect of the update alone/)).toBeInTheDocument();
  });

  it('accounts for every day of collection outage', async () => {
    vi.mocked(getGlobalHistoryAPI).mockResolvedValue(apiResponse(history));
    render(<GlobalHistorySection />);

    expect(await screen.findByText(/Collection was down for 26 days in total/)).toBeInTheDocument();
  });

  it('steps aside when the API is not deployed or fails', async () => {
    vi.mocked(getGlobalHistoryAPI).mockRejectedValue(new Error('404'));
    const { container } = render(<GlobalHistorySection />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('steps aside when there is no history yet', async () => {
    vi.mocked(getGlobalHistoryAPI).mockResolvedValue(apiResponse({ ...history, daily: [], latest: null }));
    const { container } = render(<GlobalHistorySection />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
