import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n/i18n';
import { ServerDetailHeader } from './ServerDetailHeader';
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

function renderHeader(overrides: Partial<ServerSummary>) {
  return render(
    <MemoryRouter>
      <ServerDetailHeader server={{ ...server, ...overrides }} />
    </MemoryRouter>
  );
}

describe('ServerDetailHeader', () => {
  it('shows the address and a copy button while the IP is known', () => {
    renderHeader({});

    expect(screen.getByText('203.0.113.7:7777')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy address' })).toBeInTheDocument();
  });

  it('drops the address and copy button when the API hides the IP', () => {
    renderHeader({ online: false, ip: null, lastSeen: '2026-09-24T06:12:00Z' });

    expect(screen.queryByText(/:7777/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy address' })).not.toBeInTheDocument();
    expect(screen.getByText(/IP address is hidden/)).toBeInTheDocument();
  });

  it('names a server without a title or IP by its ID', () => {
    renderHeader({ online: false, ip: null, info: '' });

    expect(screen.getByRole('heading', { name: '#7' })).toBeInTheDocument();
  });
});
