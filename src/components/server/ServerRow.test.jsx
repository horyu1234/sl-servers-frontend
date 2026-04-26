import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';
import { ServerRow } from './ServerRow';

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
};

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
