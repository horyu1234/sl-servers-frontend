import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { Popup } from 'leaflet';
import SafeHtml from '../shell/SafeHtml';
import { useLocalePath } from '../shell/LocaleLink';
import { pathOf } from '../../site/routes';
import type { ServerLoc } from '../../types/api';

export function MapPopup({ popup, server }: { popup: Popup; server: ServerLoc }) {
  const { t } = useTranslation();
  const localePath = useLocalePath();

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
        href={localePath(pathOf('server', { serverId: server.serverId }))}
        className="block text-xs text-primary hover:underline"
      >
        {t('all-server-map.server-info-btn')}
      </a>
    </div>,
    // ServerMarker binds the popup to a div, not to a string.
    popup.getContent() as HTMLElement
  );
}

export default MapPopup;
