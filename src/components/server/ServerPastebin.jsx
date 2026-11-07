import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { pastebinEmbedUrl, pastebinPageUrl } from '../../lib/format/pastebin';

// Pastebin's terms forbid fetching pastes to re-render them here, so this shows
// their official embed. It is cross-origin: the page cannot read the content or
// tell a missing paste from a working one, which is why the notice and the link
// to Pastebin stay visible in every state.
//
// The empty sandbox grants the embedded page nothing: no scripts, forms, popups,
// downloads or navigation of this page, so even the links in Pastebin's own
// header bar do nothing and the link in the card header is the only way out.
// credentialless also keeps visitors' Pastebin cookies out of the request.
// The embed only comes in a light theme and cannot be styled from here, so the
// frame is inverted to sit on this dark-only site.
export function ServerPastebin({ pasteKey }) {
  const { t } = useTranslation();
  const [loadedKey, setLoadedKey] = useState(null);
  const embedUrl = pastebinEmbedUrl(pasteKey);

  if (!embedUrl) return null;

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-4 sm:p-5">
        <CardTitle>{t('server-info.pastebin')}</CardTitle>
        <a
          href={pastebinPageUrl(pasteKey)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
        >
          {t('server-info.pastebin-embed.open')}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="relative h-96 overflow-hidden rounded-md border border-border sm:h-[28rem]">
          {loadedKey !== pasteKey && (
            <Skeleton
              className="absolute inset-0 rounded-none"
              role="status"
              aria-label={t('server-info.pastebin-embed.loading')}
            />
          )}
          <iframe
            key={pasteKey}
            title={t('server-info.pastebin-embed.frame-title')}
            src={embedUrl}
            loading="lazy"
            sandbox=""
            credentialless
            referrerPolicy="no-referrer"
            className="h-full w-full invert hue-rotate-180"
            onLoad={() => setLoadedKey(pasteKey)}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('server-info.pastebin-embed.notice')}</p>
      </CardContent>
    </Card>
  );
}

export default ServerPastebin;
