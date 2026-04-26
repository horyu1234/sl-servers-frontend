import React from 'react';
import { useTranslation } from 'react-i18next';
import { Popup } from 'react-leaflet';
import SafeHtml from '../shell/SafeHtml';

export function MapPopup({ server }) {
  const { t } = useTranslation();
  return (
    <Popup minWidth={220} closeButton>
      <div className="space-y-2">
        <SafeHtml html={server.info} />
        <a
          target="_blank"
          rel="noreferrer"
          href={`/servers/${server.serverId}`}
          className="text-xs text-primary hover:underline"
        >
          {t('all-server-map.server-info-btn')}
        </a>
      </div>
    </Popup>
  );
}

export default MapPopup;
