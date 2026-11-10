import React from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleNavLink } from '../shell/LocaleLink';
import { pathOf } from '../../site/routes';
import { cn } from '@/lib/cn';

/** Links between the statistics pages. Only the overview is in the top menu. */
export function StatsNav() {
  const { t } = useTranslation();
  const items = [
    { to: pathOf('stats'), label: t('navbar.all-stats'), end: true },
    { to: pathOf('records'), label: t('navbar.records'), end: false },
    { to: pathOf('versions'), label: t('navbar.versions'), end: false },
    { to: pathOf('reports'), label: t('navbar.reports'), end: false },
  ];

  return (
    <nav aria-label={t('pages.stats.more')} className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <LocaleNavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn(
            'rounded-md border border-border px-3 py-1.5 text-xs no-underline transition-colors',
            isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {item.label}
        </LocaleNavLink>
      ))}
    </nav>
  );
}

export default StatsNav;
