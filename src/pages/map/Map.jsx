import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { canvas } from 'leaflet';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { PageHeader } from '../../components/shared/PageHeader';
import { getServerMap } from '../../modules/serverMap';
import { MapPopup } from '../../components/map/MapPopup';
import { plainServerName } from '../../lib/format/serverName';
import { useDocumentTitle } from '../../lib/hooks/useDocumentTitle';
import { cartoTileUrl } from './tileUrl';

import 'leaflet/dist/leaflet.css';
import './map.css';

const TILE_URL = cartoTileUrl(import.meta.env.VITE_CARTO_API_KEY);
const MARKER_STYLE = { color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.55 };
// Canvas keeps ~1,100 markers cheap. The tolerance widens each small dot's hit
// area so it stays tappable on touch screens.
const MARKER_RENDERER = canvas({ tolerance: 8 });

// Tooltip content mounts only when opened, so parsing here costs one server,
// not all ~1,100 on every render.
function ServerName({ info }) {
  return plainServerName(info);
}

export default function Map() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const fetching = useSelector((s) => s.serverMap.fetching);
  const data = useSelector((s) => s.serverMap.data);
  useDocumentTitle(t('all-server-map.title'));

  useEffect(() => {
    dispatch(getServerMap());
  }, [dispatch]);

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
        <MapContainer
          className="h-full w-full"
          center={[30.0, 31.0]}
          zoom={2}
          minZoom={2}
          maxZoom={18}
          renderer={MARKER_RENDERER}
        >
          <TileLayer
            url={TILE_URL}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {!fetching && data.map((serverLoc) => (
            <CircleMarker
              key={serverLoc.serverId}
              center={[serverLoc.location.lat, serverLoc.location.long]}
              radius={5}
              pathOptions={MARKER_STYLE}
            >
              <Tooltip><ServerName info={serverLoc.info} /></Tooltip>
              <MapPopup server={serverLoc} />
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
