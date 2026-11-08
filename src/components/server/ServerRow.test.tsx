import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import i18n from '../../i18n/i18n';
import { ServerRow } from './ServerRow';
import type { ServerSummary } from '../../types/api';

const sampleServer = {
  serverId: 42,
  isoCode: 'KR',
  ip: '1.2.3.4',
  port: 7777,
  version: '14.2.6',
  friendlyFire: false,
  whitelist: false,
  modded: false,
  players: '22/30',
  info: 'Site-19 Mirror',
  techList: [{ name: 'EXILED', version: '9.13.3' }],
  distance: 100,
} as ServerSummary;

function renderRow(props = {}) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ServerRow server={sampleServer} trend={[1,2,3,4,5,6,7,8,9,10,11,12]} {...props}/>
      </MemoryRouter>
    </Provider>
  );
}

describe('ServerRow', () => {
  afterEach(() => act(() => i18n.changeLanguage('en-US')));

  it('renames the country when the language changes', async () => {
    renderRow();
    expect(screen.getByText('South Korea')).toBeInTheDocument();

    await act(() => i18n.changeLanguage('ko-KR'));

    expect(screen.getByText('대한민국')).toBeInTheDocument();
  });

  it('renders the server name', () => {
    renderRow();
    expect(screen.getByText(/Site-19 Mirror/)).toBeInTheDocument();
  });
  it('renders the players ratio', () => {
    renderRow();
    expect(screen.getByText(/22.*\/.*30/)).toBeInTheDocument();
  });
  it('invokes onClick when the row is clicked', () => {
    const onClick = vi.fn();
    renderRow({ onClick });
    fireEvent.click(screen.getByRole('button', { name: /Site-19 Mirror/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
