import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { canvas, map as createMap, tileLayer } from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { PageHeader } from '../../components/shared/PageHeader';
import { useAppDispatch, useAppSelector } from '../../modules/hooks';
import { getServerMap } from '../../modules/serverMap';
import { ServerMarker } from '../../components/map/ServerMarker';
import { useDocumentTitle } from '../../lib/hooks/useDocumentTitle';
import { cartoTileUrl } from './tileUrl';

import 'leaflet/dist/leaflet.css';
import './map.css';

const TILE_URL = cartoTileUrl(import.meta.env.VITE_CARTO_API_KEY);
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
// Canvas keeps ~1,100 markers cheap. The tolerance widens each small dot's hit
// area so it stays tappable on touch screens.
const MARKER_RENDERER = canvas({ tolerance: 8 });

export default function Map() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fetching = useAppSelector((s) => s.serverMap.fetching);
  const data = useAppSelector((s) => s.serverMap.data);
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  useDocumentTitle(t('all-server-map.title'));

  useEffect(() => {
    dispatch(getServerMap());
  }, [dispatch]);

  useEffect(() => {
    // Effects run after commit, so the ref already points at the div.
    const instance = createMap(containerRef.current!, {
      center: [30.0, 31.0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      renderer: MARKER_RENDERER,
    });
    tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(instance);
    setMap(instance);
    return () => { instance.remove(); };
  }, []);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-6">
      <PageHeader
        className="mb-4"
        title={t('all-server-map.title')}
        actions={fetching
          ? t('filter-option.refreshing')
          : t('all-server-map.location-count', { total: data.length.toLocaleString() })}
      />
      <div className="h-[calc(100dvh-11rem)] min-h-[460px] w-full overflow-hidden rounded-lg border border-border">
        <div ref={containerRef} className="h-full w-full" />
        {map && !fetching && data.map((serverLoc) => (
          <ServerMarker key={serverLoc.serverId} map={map} server={serverLoc} />
        ))}
      </div>
    </div>
  );
}
