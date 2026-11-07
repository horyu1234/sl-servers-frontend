import React from 'react';
import { useTranslation } from 'react-i18next';

export function ServerMetaStrip({ server, compact = false }) {
  const { t } = useTranslation();
  const yes = t('server-list.tech.yes');
  const no  = t('server-list.tech.no');

  // server.techList carries third-party annotations like { name: 'EXILED', version: '9.13.3' }.
  const exiled = (server.techList || []).find((e) => /exiled/i.test(e.name));

  if (compact) {
    return (
      <div className="truncate text-[11px] leading-4 text-muted-foreground">
        v{server.version} · FF {server.friendlyFire ? yes : no} · WL {server.whitelist ? yes : no}
      </div>
    );
  }
  return (
    <div className="truncate text-[11px] leading-4 text-muted-foreground">
      <span><span className="text-foreground/80">v</span>{server.version}</span>
      <span className="mx-1.5 text-muted-foreground/40">|</span>
      <span><span className="text-foreground/80">FF</span> {server.friendlyFire ? yes : no}</span>
      <span className="mx-1.5 text-muted-foreground/40">|</span>
      <span><span className="text-foreground/80">WL</span> {server.whitelist ? yes : no}</span>
      {exiled && (
        <>
          <span className="mx-1.5 text-muted-foreground/40">|</span>
          <span><span className="text-foreground/80">EXILED</span> {exiled.version}</span>
        </>
      )}
    </div>
  );
}

export default ServerMetaStrip;
