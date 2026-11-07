import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import SafeHtml from '../shell/SafeHtml';

export function MapPopup({ popup, server }) {
  const { t } = useTranslation();

  // Leaflet measured the popup before this content existed, and a language
  // change resizes it, so it has to lay out again after every render.
  useEffect(() => {
    popup.update();
  });

  return createPortal(
    <div className="space-y-2">
      <SafeHtml html={server.info} />
      <a
        target="_blank"
        rel="noreferrer"
        href={`/servers/${server.serverId}`}
        className="block text-xs text-primary hover:underline"
      >
        {t('all-server-map.server-info-btn')}
      </a>
    </div>,
    popup.getContent()
  );
}

export default MapPopup;
