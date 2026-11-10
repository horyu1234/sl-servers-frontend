import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../store';
import i18n from '../i18n/i18n';
import App from './App';

function visit(path: string) {
  window.history.pushState({}, '', path);
  return render(<Provider store={store}><App /></Provider>);
}

afterEach(async () => {
  window.history.pushState({}, '', '/');
  document.head.innerHTML = '';
  await act(() => i18n.changeLanguage('en-US'));
});

describe('addresses of the app', () => {
  it('shows a written page in English at the plain address', async () => {
    visit('/about');

    expect(await screen.findByRole('heading', { level: 1, name: 'About SCP List' })).toBeInTheDocument();
    expect(i18n.language).toBe('en-US');
  });

  it('switches to the language an address names and keeps the menu inside it', async () => {
    visit('/ko/about');

    expect(await screen.findByRole('heading', { level: 1, name: 'SCP List 소개' })).toBeInTheDocument();
    expect(i18n.language).toBe('ko-KR');
    const menu = within(screen.getByRole('banner'));
    expect(menu.getByRole('link', { name: '랭킹' })).toHaveAttribute('href', '/ko/rankings');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://scplist.kr/ko/about');
  });

  it('links every section of the site from the footer', async () => {
    visit('/privacy');
    await screen.findByRole('heading', { level: 1, name: 'Privacy policy' });

    const footer = within(screen.getByRole('contentinfo'));
    for (const [name, href] of [['Rankings', '/rankings'], ['Game versions', '/versions'], ['Reports', '/reports'], ['Privacy', '/privacy'], ['Contact', '/contact']]) {
      expect(footer.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it.each([
    '/nothing-here',
    '/xx/stats',
    '/servers/abc',
    '/reports/2026-13',
  ])('shows the 404 page at %s', async (path) => {
    visit(path);

    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });
});
