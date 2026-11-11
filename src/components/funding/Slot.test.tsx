import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import '../../i18n/i18n';
import { AdSlot } from './Slot';
import type { AdContent } from './Slot';
import { resetAdsForTest } from './loader';

// The jsdom of this test file. Vitest shares it as a global.
declare const jsdom: { reconfigure(options: { url: string }): void };

const SCRIPT_HOST = 'https://pagead2.googlesyndication.com/';

function adScript() {
  return Array.from(document.querySelectorAll('script')).find((script) => script.src.startsWith(SCRIPT_HOST));
}

/** The ads asked for so far. The queue stays a plain array because the real script never loads. */
function requests() {
  return (window.adsbygoogle ?? []) as unknown[];
}

function Go({ to }: { to: string }) {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate(to)}>{to}</button>;
}

function renderSlot(content: AdContent = 'shown', path = '/') {
  const page = (shown: AdContent) => (
    <React.StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <AdSlot placement="list" content={shown} />
        <Go to="/?country=KR" />
        <Go to="/rankings" />
      </MemoryRouter>
    </React.StrictMode>
  );
  const view = render(page(content));
  return { ...view, show: (shown: AdContent) => view.rerender(page(shown)) };
}

beforeEach(() => {
  localStorage.clear();
  // The visitor has answered the cookie banner and allowed personalised ads.
  localStorage.setItem('silktideCookieBanner_InitialChoice', '1');
  localStorage.setItem('silktideCookieChoice_advertising', 'true');
  resetAdsForTest();
  adScript()?.remove();
  delete window.adsbygoogle;
});

afterEach(() => {
  vi.useRealTimers();
  jsdom.reconfigure({ url: 'http://localhost:3000/' });
});

describe('outside the live site', () => {
  it('draws a box of the size of the ad, with the label and the link to the reason', () => {
    const { container } = renderSlot();

    expect(screen.getByText('Advertisement')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Why this site has ads' })).toHaveAttribute('href', '/about/funding');
    expect(screen.getByText('728 × 90')).toBeInTheDocument();
    expect(container.querySelector('ins')).toBeNull();
    expect(adScript()).toBeUndefined();
  });

  it('keeps the link under the language of the address', () => {
    renderSlot('shown', '/ko');

    expect(screen.getByRole('link', { name: 'Why this site has ads' })).toHaveAttribute('href', '/ko/about/funding');
  });

  it('takes no room on a page without content', () => {
    renderSlot('missing');

    expect(screen.queryByText('Advertisement')).not.toBeInTheDocument();
  });
});

describe('on the live site', () => {
  beforeEach(() => {
    jsdom.reconfigure({ url: 'https://scplist.kr/' });
  });

  it('asks for one ad, of a size set on the element itself', () => {
    const { container } = renderSlot();
    const ins = container.querySelector('ins');

    expect(ins).toHaveClass('adsbygoogle');
    expect(ins).toHaveAttribute('data-ad-client', 'ca-pub-9284546494175734');
    expect(ins).toHaveAttribute('data-ad-slot', '4813362376');
    expect(ins).toHaveStyle({ display: 'block', width: '728px', height: '90px' });
    expect(ins).not.toHaveAttribute('data-ad-format');
    expect(adScript()).toBeDefined();
    expect(requests()).toHaveLength(1);
  });

  it('keeps the room while the content loads and asks once it is there', () => {
    const { container, show } = renderSlot('pending');

    expect(screen.getByText('Advertisement')).toBeVisible();
    expect(container.querySelector('ins')).not.toBeNull();
    expect(adScript()).toBeUndefined();
    expect(requests()).toHaveLength(0);

    show('shown');

    expect(adScript()).toBeDefined();
    expect(requests()).toHaveLength(1);
  });

  it('asks for nothing on a page without content, and keeps its ad when the content goes away', () => {
    const { show } = renderSlot('missing');
    expect(adScript()).toBeUndefined();

    show('shown');
    expect(requests()).toHaveLength(1);

    show('missing');
    expect(screen.getByText('Advertisement')).not.toBeVisible();

    show('shown');
    expect(screen.getByText('Advertisement')).toBeVisible();
    expect(requests()).toHaveLength(1);
  });

  it('keeps its ad when only the query changes and asks again on a new page', () => {
    renderSlot();
    expect(requests()).toHaveLength(1);

    act(() => screen.getByRole('button', { name: '/?country=KR' }).click());
    expect(requests()).toHaveLength(1);

    act(() => screen.getByRole('button', { name: '/rankings' }).click());
    expect(requests()).toHaveLength(2);
  });

  it('gives its room up when no ad came back', async () => {
    const { container } = renderSlot();

    container.querySelector('ins')?.setAttribute('data-ad-status', 'unfilled');

    await waitFor(() => expect(screen.getByText('Advertisement')).not.toBeVisible());
  });

  it('keeps its room for an ad that came back', async () => {
    const { container } = renderSlot();

    container.querySelector('ins')?.setAttribute('data-ad-status', 'filled');
    // The observer reports a moment after the change.
    await act(() => Promise.resolve());

    expect(screen.getByText('Advertisement')).toBeVisible();
  });

  it('gives its room up when the script is blocked', () => {
    renderSlot();

    act(() => { adScript()?.dispatchEvent(new Event('error')); });

    expect(screen.getByText('Advertisement')).not.toBeVisible();
  });

  it('closes when the request gets no answer, as with an ad blocker that swallows it', () => {
    vi.useFakeTimers();
    const { container } = renderSlot();
    act(() => { adScript()?.dispatchEvent(new Event('load')); });

    act(() => { vi.advanceTimersByTime(4000); });
    expect(screen.getByText('Advertisement')).toBeVisible();

    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByText('Advertisement')).not.toBeVisible();
    // Still laid out: the script only requests an ad for an element that is displayed.
    expect(container.querySelector('ins')).toHaveStyle({ display: 'block', height: '90px' });
  });

  it('starts closed on the next page after that, and opens for an ad that does come', async () => {
    vi.useFakeTimers();
    renderSlot();
    act(() => { adScript()?.dispatchEvent(new Event('load')); });
    act(() => { vi.advanceTimersByTime(5500); });
    vi.useRealTimers();

    act(() => screen.getByRole('button', { name: '/rankings' }).click());
    expect(screen.getByText('Advertisement')).not.toBeVisible();
    expect(requests()).toHaveLength(2);

    document.querySelector('ins')?.setAttribute('data-ad-status', 'filled');
    await waitFor(() => expect(screen.getByText('Advertisement')).toBeVisible());

    act(() => screen.getByRole('button', { name: '/?country=KR' }).click());
    expect(screen.getByText('Advertisement')).toBeVisible();
  });

  it('does not start the wait before the script has loaded', () => {
    vi.useFakeTimers();
    renderSlot();

    act(() => { vi.advanceTimersByTime(60_000); });

    expect(screen.getByText('Advertisement')).toBeVisible();
  });
});
