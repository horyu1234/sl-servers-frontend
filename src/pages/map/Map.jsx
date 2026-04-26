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
    <div className="px-4 py-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('all-server-map.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-12rem)] w-full overflow-hidden rounded-b-lg">
            <MapContainer
              className="h-full w-full"
              center={[30.0, 31.0]}
              zoom={2}
              minZoom={2}
              maxZoom={18}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
