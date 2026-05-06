import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerMap } from '../../modules/serverMap';
import { MapPopup } from '../../components/map/MapPopup';

import './map.css';

export default function Map() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const fetching = useSelector((s) => s.serverMap.fetching);
  const data = useSelector((s) => s.serverMap.data);

  useEffect(() => {
    dispatch(getServerMap());
  }, [dispatch]);

  return (
    <div className="px-3 py-3 sm:px-4 sm:py-4">
      <Card className="min-w-0">
        <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
          <CardTitle className="text-base">{t('all-server-map.title')}</CardTitle>
          <div className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {fetching ? t('filter-option.refreshing') : `${data.length.toLocaleString()} locations`}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100dvh-10rem)] min-h-[460px] w-full overflow-hidden rounded-b-lg sm:h-[calc(100dvh-11rem)]">
            <MapContainer
              className="h-full w-full"
              center={[30.0, 31.0]}
              zoom={2}
              minZoom={2}
              maxZoom={18}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {!fetching && data.map((serverLoc) => (
                <Marker key={serverLoc.serverId} position={[serverLoc.location.lat, serverLoc.location.long]}>
                  <Tooltip>Server ID: {serverLoc.serverId}</Tooltip>
                  <MapPopup server={serverLoc} />
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
