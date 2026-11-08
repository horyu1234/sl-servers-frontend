import React from 'react';
import { afterAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import i18n from '../../i18n/i18n';
import { ServerOfflineNotice } from './ServerOfflineNotice';

const NOW = Date.parse('2026-11-08T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

function renderNotice(server: { online: boolean; ip: string | null; lastSeen?: string | null }) {
  return render(<ServerOfflineNotice server={server} now={NOW} />);
}

describe('ServerOfflineNotice', () => {
  afterAll(() => i18n.changeLanguage('en-US'));

  it('shows nothing for an online server', async () => {
    await i18n.changeLanguage('en-US');
    const { container } = renderNotice({ online: true, ip: '1.2.3.4', lastSeen: null });

    expect(container).toBeEmptyDOMElement();
  });

  it('says how long a recently offline server has been down and keeps quiet about the IP', async () => {
    await i18n.changeLanguage('en-US');
    renderNotice({ online: false, ip: '1.2.3.4', lastSeen: new Date(NOW - 3 * DAY).toISOString() });

    expect(screen.getByText(/Last online 3 days ago/)).toBeInTheDocument();
    expect(screen.queryByText(/IP address is hidden/)).not.toBeInTheDocument();
  });

  it('explains the hidden IP of a server offline for more than 30 days', async () => {
    await i18n.changeLanguage('ko-KR');
    renderNotice({ online: false, ip: null, lastSeen: new Date(NOW - 45 * DAY).toISOString() });

    expect(screen.getByText(/45일 전부터 오프라인입니다/)).toBeInTheDocument();
    expect(screen.getByText('30일 넘게 오프라인인 서버라서 IP 주소를 표시하지 않습니다.')).toBeInTheDocument();
  });

  it('falls back to a plain offline line when there is no record', async () => {
    await i18n.changeLanguage('en-US');
    renderNotice({ online: false, ip: null, lastSeen: null });

    expect(screen.getByText('Offline, with no record of when it was last online')).toBeInTheDocument();
    expect(screen.getByText(/IP address is hidden/)).toBeInTheDocument();
  });

  it('stays out of the way while the API does not send lastSeen yet', async () => {
    await i18n.changeLanguage('en-US');
    const { container } = renderNotice({ online: false, ip: '1.2.3.4' });

    expect(container).toBeEmptyDOMElement();
  });
});
