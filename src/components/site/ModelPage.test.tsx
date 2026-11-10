import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/i18n';
import { ModelPage } from './ModelPage';
import { DataPage } from './ResourcePage';
import { docModel } from '../../site/pages/docs';
import { rankingsModel } from '../../site/pages/rankings';
import { reportModel } from '../../site/pages/reports';
import { rankings, report, testContext } from '../../site/pages/testData';
import { apiResponse } from '../../testUtils';
import type { RankingsResponse } from '../../types/api';

const en = testContext();

function renderAt(path: string, ui: React.ReactElement) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

afterEach(async () => {
  document.head.innerHTML = '';
  await act(() => i18n.changeLanguage('en-US'));
});

describe('ModelPage', () => {
  it('draws the heading, the opening text and a card for each section', () => {
    renderAt('/rankings', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Server rankings' })).toBeInTheDocument();
    expect(screen.getByText(/These rankings cover the 1,100 servers/)).toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(4);
    expect(screen.getAllByRole('link', { name: 'Dream <Mirror> #1' })[0]).toHaveAttribute('href', '/servers/99728');
    expect(document.title).toBe('Top SCP: SL servers: most popular, rising and longest running · SCP: Secret Laboratory Server List');
  });

  it('keeps links under the language prefix of the address', () => {
    renderAt('/ko/rankings', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(screen.getAllByRole('link', { name: 'Dream <Mirror> #1' })[0]).toHaveAttribute('href', '/ko/servers/99728');
    expect(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('link')).toHaveAttribute('href', '/ko');
  });

  it('shows tiles, a country flag and the parts only the browser draws', () => {
    renderAt('/reports/2026-10', (
      <ModelPage model={reportModel(en, report)} top={<div>stats menu</div>}>
        <div>chart</div>
      </ModelPage>
    ));

    expect(screen.getByText('Peak players')).toBeInTheDocument();
    expect(screen.getByText('stats menu')).toBeInTheDocument();
    expect(screen.getByText('chart')).toBeInTheDocument();
    expect(screen.getAllByAltText('RU')[0]).toHaveAttribute('src', expect.stringContaining('/RU.svg'));
    // A server whose row is gone is named but not linked.
    expect(screen.queryByRole('link', { name: '#4' })).toBeNull();
    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  it('draws a written page with its links, code and tables', () => {
    const model = docModel(en, 'api');
    renderAt('/ko/api', <ModelPage model={model!} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Endpoints' })).toBeInTheDocument();
    expect(screen.getByText(/curl "https:\/\/api\.scplist\.kr/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'support@scplist.kr' })[0]).toHaveAttribute('href', 'mailto:support@scplist.kr');
  });
});

describe('DataPage', () => {
  it('shows the page once its data has loaded', async () => {
    const load = vi.fn().mockResolvedValue(apiResponse<RankingsResponse>(rankings));

    renderAt('/rankings', <DataPage load={load} resourceKey="rankings" title="Rankings" model={rankingsModel} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(document.title).toBe('Rankings · SCP: Secret Laboratory Server List');
    expect(await screen.findByRole('heading', { level: 1, name: 'Server rankings' })).toBeInTheDocument();
  });

  it('follows the language on screen', async () => {
    const load = vi.fn().mockResolvedValue(apiResponse<RankingsResponse>(rankings));
    renderAt('/rankings', <DataPage load={load} resourceKey="rankings" title="Rankings" model={rankingsModel} />);
    await screen.findByRole('heading', { level: 1, name: 'Server rankings' });

    await act(() => i18n.changeLanguage('ko-KR'));

    expect(screen.getByRole('heading', { level: 1, name: '서버 랭킹' })).toBeInTheDocument();
  });

  it('says so and stays out of the index when the data does not load', async () => {
    const load = vi.fn().mockRejectedValue(new Error('404'));

    renderAt('/countries/zz', <DataPage load={load} resourceKey="zz" title="Country" model={rankingsModel} />);

    expect(await screen.findByText("This page can't be shown right now")).toBeInTheDocument();
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex'));
    expect(screen.getByRole('link', { name: 'Server list' })).toHaveAttribute('href', '/');
  });
});
