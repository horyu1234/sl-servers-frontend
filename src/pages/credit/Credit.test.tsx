import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../i18n/locale/en-US.json';
import Credit from './Credit';

const manifest = {
  packages: [
    {
      name: 'react-leaflet',
      version: '5.0.0',
      license: 'Hippocratic-2.1',
      repository: 'https://github.com/PaulLeCam/react-leaflet',
      author: null,
      notices: [{ file: 'LICENSE.md', text: 0 }],
    },
    {
      name: 'swagger-ui-react',
      version: '5.34.1',
      license: 'Apache-2.0',
      repository: 'https://github.com/swagger-api/swagger-ui',
      author: null,
      notices: [{ file: 'LICENSE', text: 1 }, { file: 'NOTICE', text: 2 }],
    },
    {
      name: 'toggle-selection',
      version: '1.0.6',
      license: 'MIT',
      repository: 'https://github.com/sudodoki/toggle-selection',
      author: 'sudodoki',
      notices: [],
    },
    {
      name: 'Silktide Consent Manager',
      version: null,
      license: 'MIT',
      repository: 'https://github.com/silktide/consent-manager',
      author: null,
      notices: [{ file: 'LICENSE', text: 3 }],
    },
  ],
  texts: ['Hippocratic text', 'Apache text', 'SmartBear notice', 'Silktide text'],
};

function respondWith(body: unknown, ok = true) {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
    ok,
    status: ok ? 200 : 404,
    json: () => Promise.resolve(body),
  })));
}

async function openLicenseGroup(name: string) {
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(name) }));
}

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en-US',
    resources: { 'en-US': { translation: en } },
    interpolation: { escapeValue: false },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Credit', () => {
  it('loads the list the build emits', async () => {
    respondWith(manifest);

    render(<Credit />, { wrapper: MemoryRouter });

    expect(await screen.findByRole('button', { name: /Hippocratic-2\.1/ })).toBeInTheDocument();
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/third-party-licenses.json');
  });

  it('shows the full license text of an opened package', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    await openLicenseGroup('Hippocratic-2\\.1');
    fireEvent.click(await screen.findByText('react-leaflet'));

    expect(await screen.findByText('Hippocratic text')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: en.credit.repository })).toHaveAttribute(
      'href',
      'https://github.com/PaulLeCam/react-leaflet',
    );
  });

  it('shows NOTICE files alongside the license', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    await openLicenseGroup('Apache-2\\.0');
    fireEvent.click(await screen.findByText('swagger-ui-react'));

    expect(await screen.findByText('Apache text')).toBeInTheDocument();
    expect(screen.getByText('SmartBear notice')).toBeInTheDocument();
  });

  it('says so when a package has no license file', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    await openLicenseGroup('MIT');
    fireEvent.click(await screen.findByText('toggle-selection'));

    expect(await screen.findByText(/ships without a license file/)).toBeInTheDocument();
    expect(screen.getByText('Author: sudodoki')).toBeInTheDocument();
  });

  it('filters packages by name', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    await screen.findByRole('button', { name: /Hippocratic-2\.1/ });
    fireEvent.change(screen.getByPlaceholderText(en.credit['search-placeholder']), {
      target: { value: 'swagger' },
    });

    expect(screen.queryByRole('button', { name: /Hippocratic-2\.1/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apache-2\.0/ })).toBeInTheDocument();
  });

  it('explains a search with no results', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    await screen.findByRole('button', { name: /Hippocratic-2\.1/ });
    fireEvent.change(screen.getByPlaceholderText(en.credit['search-placeholder']), {
      target: { value: 'nothing-like-this' },
    });

    expect(screen.getByText(en.credit['no-match'])).toBeInTheDocument();
  });

  it('reports a failed load instead of an empty list', async () => {
    respondWith({}, false);

    render(<Credit />, { wrapper: MemoryRouter });

    expect(await screen.findByText(en.credit['load-failed'])).toBeInTheDocument();
    expect(screen.queryByText(en.credit['no-match'])).not.toBeInTheDocument();
  });

  it('reports a response that is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    })));

    render(<Credit />, { wrapper: MemoryRouter });

    expect(await screen.findByText(en.credit['load-failed'])).toBeInTheDocument();
  });

  it('credits data and services the build cannot see, with a description for each', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    for (const name of ['CARTO', 'OpenStreetMap', 'MaxMind GeoLite2', 'country-flag-icons', 'Pastebin']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getByText(/includes GeoLite2 data created by MaxMind/)).toBeInTheDocument();
    Object.values(en.credit.resources).forEach((description) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
    expect(await screen.findByRole('button', { name: /Hippocratic-2\.1/ })).toBeInTheDocument();
  });

  it('links to the source code of the site', async () => {
    respondWith(manifest);
    render(<Credit />, { wrapper: MemoryRouter });

    expect(screen.getByRole('link', { name: en.credit['site-license'] })).toHaveAttribute(
      'href',
      'https://github.com/horyu1234/sl-servers-frontend',
    );
    await screen.findByRole('button', { name: /Hippocratic-2\.1/ });
  });
});
