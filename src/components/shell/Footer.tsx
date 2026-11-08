import React from 'react';
import type { ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import SafeHtml from './SafeHtml';

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-muted-foreground no-underline transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border bg-card/50">
      {/* pb-20 below lg keeps the last links clear of the fixed consent icon. */}
      <div className="mx-auto grid max-w-screen-xl gap-8 px-4 pb-20 pt-8 md:grid-cols-3 lg:pb-8">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">SCP: SL Servers</h2>
          <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Copyright © 2020-{year}. Hyunoh Ryu (Horyu) All rights reserved.
          </p>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">{t('footer.links')}</h2>
          <ul className="space-y-1 text-sm">
            <FooterLink to="/">{t('navbar.server-list')}</FooterLink>
            <FooterLink to="/stats">{t('navbar.all-stats')}</FooterLink>
            <FooterLink to="/map">{t('navbar.all-server-map')}</FooterLink>
            <FooterLink to="/api">API</FooterLink>
            <FooterLink to="/credit">{t('navbar.credit')}</FooterLink>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">{t('footer.translation-title')}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{t('footer.translation-body')}</p>
          <Button asChild variant="outline" size="sm">
            <a href="https://github.com/horyu1234/sl-servers-frontend" target="_blank" rel="noreferrer" className="gap-2">
              <GitHubIcon className="h-4 w-4" /> {t('footer.contribute')}
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
