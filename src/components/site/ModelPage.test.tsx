import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

beforeEach(() => {
  // jsdom has no layout to scroll.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  document.head.innerHTML = '';
  await act(() => i18n.changeLanguage('en-US'));
});

describe('ModelPage', () => {
  it('draws the heading, the opening text and a card for each section', () => {
    renderAt('/reports/2026-10', <ModelPage model={reportModel(en, report)} />);

    expect(screen.getByRole('heading', { level: 1, name: 'October 2026 report' })).toBeInTheDocument();
    expect(screen.getByText(/public SCP: Secret Laboratory servers peaked at 5,590 players/)).toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(4);
    expect(screen.getAllByRole('link', { name: 'Dream <Mirror> #1' })[0]).toHaveAttribute('href', '/servers/99728');
    expect(document.title).toBe('SCP: SL server report: October 2026 · SCP: Secret Laboratory Server List');
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

  it('colors a rise green and a fall red', () => {
    renderAt('/reports/2026-10', <ModelPage model={reportModel(en, report)} />);

    expect(screen.getAllByText('+4.2%')[0]).toHaveClass('text-primary');
    expect(screen.getByText('−3.1%')).toHaveClass('text-destructive');
    expect(screen.getByText('+4.2% vs September 2026')).toHaveClass('text-primary');
  });

  it('draws a written page with its links, code and tables', () => {
    const model = docModel(en, 'api');
    renderAt('/ko/api', <ModelPage model={model!} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Endpoints' })).toBeInTheDocument();
    expect(screen.getByText(/curl "https:\/\/api\.scplist\.kr/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'support@scplist.kr' })[0]).toHaveAttribute('href', 'mailto:support@scplist.kr');
  });

  it('carries one ad on a data page and none on a written page', () => {
    const data = renderAt('/reports/2026-10', <ModelPage model={reportModel(en, report)} />);
    expect(screen.getAllByText('Advertisement')).toHaveLength(1);
    data.unmount();

    // The page about the ads is a written page of the site, so docModel has it.
    renderAt('/about/funding', <ModelPage model={docModel(en, 'funding')!} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Why this site has ads' })).toBeInTheDocument();
    expect(screen.queryByText('Advertisement')).not.toBeInTheDocument();
  });
});

describe('section tabs', () => {
  function sectionMenu() {
    return within(screen.getByRole('navigation', { name: 'On this page' }));
  }

  it('names every board in a menu and shows the first one', () => {
    renderAt('/rankings', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(sectionMenu().getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Most popular2', 'Rising1', 'Newcomers1', 'Longest running1',
    ]);
    expect(sectionMenu().getByRole('link', { name: /Most popular/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.getByText('Highest average daily peak over the last 30 days.')).toBeVisible();
  });

  it('shows the board the address names', () => {
    renderAt('/rankings#veterans', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(sectionMenu().getByRole('link', { name: /Longest running/ })).toHaveAttribute('aria-current', 'true');
    expect(sectionMenu().getByRole('link', { name: /Most popular/ })).not.toHaveAttribute('aria-current');
    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Old guard' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Fresh server' })).toBeNull();
    // The browser scrolled for the longer page it first got, so the menu is brought back to the top.
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('leaves the scroll position alone on a page opened without a board in its address', () => {
    renderAt('/rankings', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('switches boards from the menu and keeps the address shareable', async () => {
    renderAt('/ko/rankings', <ModelPage model={rankingsModel(en, rankings)} />);

    const newcomers = sectionMenu().getByRole('link', { name: /Newcomers/ });
    expect(newcomers).toHaveAttribute('href', '/ko/rankings#newcomers');
    await act(async () => { newcomers.click(); });

    expect(newcomers).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Fresh server' })).toBeInTheDocument();
  });

  it('keeps the hidden boards in the document, like the HTML from the edge', () => {
    renderAt('/rankings', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(screen.getAllByRole('table', { hidden: true })).toHaveLength(4);
  });

  it('falls back to the first board for a fragment that names none', () => {
    renderAt('/rankings#nothing', <ModelPage model={rankingsModel(en, rankings)} />);

    expect(sectionMenu().getByRole('link', { name: /Most popular/ })).toHaveAttribute('aria-current', 'true');
  });

  it('needs no menu when only one board has servers', () => {
    const single = { ...rankings, rising: [], newcomers: [], veterans: [] };
    renderAt('/rankings', <ModelPage model={rankingsModel(en, single)} />);

    expect(screen.queryByRole('navigation', { name: 'On this page' })).toBeNull();
    expect(screen.getAllByRole('table')).toHaveLength(1);
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
    expect(screen.queryByText('Advertisement')).not.toBeInTheDocument();
  });
});
