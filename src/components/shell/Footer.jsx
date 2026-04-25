import React from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SafeHtml from './SafeHtml';

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
              <GitBranch className="h-4 w-4" /> Contribute on GitHub
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
