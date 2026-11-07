import React, { useEffect, useState } from 'react';
import { circleMarker } from 'leaflet';
import { plainServerName } from '../../lib/format/serverName';
import { MapPopup } from './MapPopup';

const MARKER_OPTIONS = { radius: 5, color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.55 };

export function ServerMarker({ map, server }) {
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const marker = circleMarker([server.location.lat, server.location.long], MARKER_OPTIONS)
      // Leaflet writes strings to innerHTML, and the name can decode to markup,
      // so it gets a text node. The function runs when the tooltip opens, so
      // parsing costs one server, not all ~1,100.
      .bindTooltip(() => document.createTextNode(plainServerName(server.info)))
      .bindPopup(document.createElement('div'), { minWidth: 220 })
      .on('popupopen', (event) => setPopup(event.popup))
      .addTo(map);
    return () => marker.remove();
  }, [map, server]);

  return popup && <MapPopup popup={popup} server={server} />;
}
