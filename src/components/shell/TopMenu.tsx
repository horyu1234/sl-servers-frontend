import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { List, BarChart3, Map as MapIcon, Settings2, Trophy, Globe2, Menu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LanguageSelect from '../topmenu/LanguageSelect';
import SiSelect from '../topmenu/SiSelect';
import SettingsMenu from '../topmenu/SettingsMenu';
import { LocaleNavLink } from './LocaleLink';
import { pathOf } from '../../site/routes';
import { cn } from '@/lib/cn';

interface NavItemProps {
  to: string;
  end: boolean;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  compact?: boolean;
}

function buildNavItems(t: TFunction): NavItemProps[] {
  return [
    { to: pathOf('list'),      end: true,  icon: List,      label: t('navbar.server-list') },
    { to: pathOf('rankings'),  end: false, icon: Trophy,    label: t('navbar.rankings') },
    { to: pathOf('countries'), end: false, icon: Globe2,    label: t('navbar.countries') },
    { to: pathOf('stats'),     end: false, icon: BarChart3, label: t('navbar.all-stats') },
    { to: pathOf('map'),       end: false, icon: MapIcon,   label: t('navbar.all-server-map') },
    { to: pathOf('api'),       end: false, icon: Settings2, label: 'API' },
  ];
}

function NavItem({ to, end, icon: Icon, label, onClick, compact = false }: NavItemProps) {
  return (
    <LocaleNavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-md text-sm transition-colors no-underline',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          isActive && 'text-foreground bg-muted'
        )
      }
    >
      <Icon className={cn('h-4 w-4', compact && 'hidden xl:block')} />
      <span>{label}</span>
    </LocaleNavLink>
  );
}

export default function TopMenu() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = buildNavItems(t);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 items-center px-4 gap-3">
        <LocaleNavLink to="/" className="flex min-w-0 items-center gap-2 font-semibold text-foreground no-underline hover:no-underline">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <img src="/favicon-32x32.png" alt="" width="20" height="20" />
          </span>
          <span className="truncate text-sm sm:hidden">SL Servers</span>
          <span className="hidden truncate sm:inline">SCP: SL Servers</span>
        </LocaleNavLink>

        <nav className="hidden lg:flex items-center gap-1 ml-2 xl:ml-4">
          {items.map((item) => <NavItem key={item.to} {...item} compact />)}
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:block">
          <SettingsMenu />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t('navbar.open-menu')}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="!w-[calc(100vw-24px)] max-w-[300px] flex flex-col">
            <SheetTitle className="sr-only">{t('navbar.menu')}</SheetTitle>
            <SheetDescription className="sr-only">{t('navbar.site-navigation')}</SheetDescription>
            <nav className="flex flex-col gap-1 mt-6">
              {items.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
              <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-muted-foreground">{t('navbar.language')}</span>
                <LanguageSelect className="w-full sm:w-[180px]" />
              </div>
              <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <span className="text-muted-foreground">{t('navbar.unit')}</span>
                <SiSelect className="w-full sm:w-[160px]" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
