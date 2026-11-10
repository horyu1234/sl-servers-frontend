import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CircleMarker, SVG, map as createMap } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import '../../i18n/i18n';
import { ServerMarker } from './ServerMarker';
import type { ServerLoc } from '../../types/api';

const server: ServerLoc = {
  serverId: 7,
  info: 'Site-19<br/>second line',
  location: { lat: 37.5, long: 127 },
};

describe('ServerMarker', () => {
  let map: LeafletMap;

  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    // jsdom has no 2D canvas context, so the test map draws with SVG.
    map = createMap(container, { center: [0, 0], zoom: 2, renderer: new SVG() });
  });

  afterEach(() => {
    const container = map.getContainer();
    map.remove();
    container.remove();
  });

  function markers() {
    const found: CircleMarker[] = [];
    map.eachLayer((layer) => {
      if (layer instanceof CircleMarker) found.push(layer);
    });
    return found;
  }

  it('adds a styled marker at the server location', () => {
    render(<ServerMarker map={map} server={server} />, { wrapper: MemoryRouter });

    const [marker] = markers();
    expect(marker.getLatLng()).toMatchObject({ lat: 37.5, lng: 127 });
    expect(marker.getRadius()).toBe(5);
    expect(marker.options).toMatchObject({ color: '#22c55e', weight: 1, fillOpacity: 0.55 });
  });

  it('shows the first line of the server name as a tooltip', () => {
    render(<ServerMarker map={map} server={server} />, { wrapper: MemoryRouter });

    markers()[0].openTooltip();

    expect(map.getContainer().querySelector('.leaflet-tooltip')).toHaveTextContent(/^Site-19$/);
  });

  it('keeps a name that decodes to markup as plain text', () => {
    const info = '&lt;img src=x onerror=alert(1)&gt;';
    render(<ServerMarker map={map} server={{ ...server, info }} />, { wrapper: MemoryRouter });

    markers()[0].openTooltip();

    const tooltip = map.getContainer().querySelector('.leaflet-tooltip');
    expect(tooltip).toHaveTextContent('<img src=x onerror=alert(1)>');
    expect(tooltip!.querySelector('img')).toBeNull();
  });

  it('renders the server info and detail link into the popup', () => {
    render(<ServerMarker map={map} server={server} />, { wrapper: MemoryRouter });

    act(() => {
      markers()[0].openPopup();
    });

    const content = map.getContainer().querySelector('.leaflet-popup-content');
    expect(content).toHaveTextContent('Site-19');
    expect(content!.querySelector('a')).toHaveAttribute('href', '/servers/7');
  });

  it('removes the marker and its open popup on unmount', () => {
    const { unmount } = render(<ServerMarker map={map} server={server} />, { wrapper: MemoryRouter });
    const [marker] = markers();
    act(() => {
      marker.openPopup();
    });

    unmount();

    expect(markers()).toHaveLength(0);
    expect(map.hasLayer(marker.getPopup()!)).toBe(false);
  });
});
