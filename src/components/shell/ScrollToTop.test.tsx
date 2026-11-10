import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, useNavigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

function Links() {
  const navigate = useNavigate();
  return (
    <>
      <Link to="/about">about</Link>
      <Link to="/ko/rankings">korean</Link>
      <Link to={{ search: '?modded=true' }}>filter</Link>
      <Link to={{ hash: '#rising' }}>section</Link>
      <button type="button" onClick={() => navigate(-1)}>back</button>
    </>
  );
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ScrollToTop />
      <Links />
    </MemoryRouter>,
  );
}

describe('ScrollToTop', () => {
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    // The window as a visitor leaves it after reading down to the footer.
    Object.defineProperty(window, 'scrollY', { value: 1200, configurable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('leaves the page a visitor arrives on where the browser put it', () => {
    renderAt('/rankings');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('starts another page at its top', async () => {
    renderAt('/rankings');
    await userEvent.click(screen.getByText('about'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });

  it('stays put for a filter, a section or another language of the same page', async () => {
    renderAt('/rankings');
    await userEvent.click(screen.getByText('filter'));
    await userEvent.click(screen.getByText('section'));
    await userEvent.click(screen.getByText('korean'));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('leaves going back to the browser', async () => {
    renderAt('/rankings');
    await userEvent.click(screen.getByText('about'));
    scrollTo.mockClear();
    await userEvent.click(screen.getByText('back'));
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
