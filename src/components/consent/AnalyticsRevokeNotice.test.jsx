import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';

const KEY = 'silktideCookieChoice_analytics';
const CHANGE_EVENT = 'silktide:consentchange';

const toastMessageSpy = vi.fn();
vi.mock('sonner', () => ({
  toast: { message: (...args) => toastMessageSpy(...args) },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const wereAnyAnalyticsScriptsLoadedSpy = vi.fn(() => false);
vi.mock('./analyticsState', () => ({
  wereAnyAnalyticsScriptsLoaded: () => wereAnyAnalyticsScriptsLoadedSpy(),
}));

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

describe('AnalyticsRevokeNotice', () => {
  beforeEach(() => {
    toastMessageSpy.mockClear();
    wereAnyAnalyticsScriptsLoadedSpy.mockClear();
    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(false);
    localStorage.clear();
    vi.resetModules();
  });

  it('does not show a toast on initial mount when consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('does not show a toast on initial mount when consent is granted', async () => {
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('does not show a toast on transition denied -> granted (forward direction)', async () => {
    localStorage.setItem(KEY, 'false');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(true));
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('shows a toast on transition granted -> denied when at least one script was loaded', async () => {
    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(true);
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(false));
    expect(toastMessageSpy).toHaveBeenCalledTimes(1);
    expect(toastMessageSpy).toHaveBeenCalledWith(
      'consent.revoke.title',
      expect.objectContaining({
        description: 'consent.revoke.description',
        action: expect.objectContaining({ label: 'consent.revoke.reload' }),
      })
    );
  });

  it('does not show a toast on revoke when no scripts were loaded', async () => {
    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(false);
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(false));
    expect(toastMessageSpy).not.toHaveBeenCalled();
  });

  it('reload action calls window.location.reload', async () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadSpy },
    });

    wereAnyAnalyticsScriptsLoadedSpy.mockReturnValue(true);
    localStorage.setItem(KEY, 'true');
    const { default: AnalyticsRevokeNotice } = await import('./AnalyticsRevokeNotice');
    render(<AnalyticsRevokeNotice />);
    act(() => setConsent(false));

    const call = toastMessageSpy.mock.calls[0];
    const opts = call[1];
    opts.action.onClick();
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });
});
