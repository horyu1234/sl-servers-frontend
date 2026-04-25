import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import SafeHtml from './SafeHtml';

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="mx-auto px-4 py-10 grid gap-10 md:grid-cols-3 max-w-screen-xl">
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">{t('navbar.title')}</h5>
          <p className="text-sm text-muted-foreground">
            SCP: SL server list with filtering options, trends and statistics.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Copyright © 2020-{year}. Horyu (류현오) All rights reserved.
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">Links</h5>
          <ul className="space-y-1 text-sm">
            <li><a href="/"        className="text-muted-foreground hover:text-foreground">Home</a></li>
            <li><a href="/stats"   className="text-muted-foreground hover:text-foreground">Statistics</a></li>
            <li><a href="/map"     className="text-muted-foreground hover:text-foreground">Server Map</a></li>
            <li><a href="/api"     className="text-muted-foreground hover:text-foreground">API</a></li>
            <li><a href="/credit"  className="text-muted-foreground hover:text-foreground" target="_blank" rel="noreferrer">Credit / Third Party Licenses</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">Translation</h5>
          <p className="text-sm text-muted-foreground mb-3">I&apos;m looking for applicants for site translation.</p>
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/horyu1234/sl-servers-frontend" target="_blank" rel="noreferrer" className="gap-2">
              <GitHubIcon className="h-4 w-4" /> Contribute on GitHub
            </a>
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">
            <SafeHtml html={t('footer.notice')} />
          </div>
        </div>
      </div>
    </footer>
  );
}
