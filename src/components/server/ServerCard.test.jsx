import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../../store';
import '../../i18n/i18n';
import { ServerCard } from './ServerCard';

const sampleServer = {
  serverId: 7,
  isoCode: 'KR',
  ip: '1.2.3.4',
  port: 7777,
  version: '14.2.6',
  friendlyFire: false,
  whitelist: false,
  modded: false,
  players: '5/30',
  info: 'Site-19 Mirror',
  techList: [{ name: 'EXILED', version: '9.13.3' }],
};

function renderCard(props = {}) {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ServerCard server={sampleServer} trend={[1,2,3]} {...props} />
      </MemoryRouter>
    </Provider>
  );
}

describe('ServerCard', () => {
  it('renders the IP:Port mono line in non-compact mode', () => {
    const { container } = renderCard();
    const monoLines = container.querySelectorAll('.font-mono');
    // The card has the name's IP fallback span (font-mono) only when info is absent;
    // with info present, the dedicated IP line under the name is the only .font-mono.
    expect(monoLines.length).toBeGreaterThanOrEqual(1);
  });

  it('omits the dedicated IP:Port line in compact mode', () => {
    const { container } = renderCard({ compact: true });
    const monoLines = container.querySelectorAll('.font-mono');
    expect(monoLines.length).toBe(0);
  });

  it('renders the meta strip in compact mode (single line)', () => {
    const { container } = renderCard({ compact: true });
    // Compact ServerMetaStrip renders `v… · FF … · WL …` as one text node.
    const meta = container.textContent;
    expect(meta).toMatch(/v14\.2\.6/);
    expect(meta).toMatch(/FF/);
    expect(meta).toMatch(/WL/);
  });
});
