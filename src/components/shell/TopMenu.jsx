import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { List, BarChart3, Map as MapIcon, Settings2, Code2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LanguageSelect from '../topmenu/LanguageSelect';
import SiSelect from '../topmenu/SiSelect';
import { cn } from '@/lib/cn';

function buildNavItems(t) {
  return [
    { to: '/',       end: true,  icon: List,      label: t('navbar.server-list') },
    { to: '/stats',  end: false, icon: BarChart3, label: t('navbar.all-stats') },
    { to: '/map',    end: false, icon: MapIcon,   label: t('navbar.all-server-map') },
    { to: '/api',    end: false, icon: Settings2, label: 'API' },
    { to: '/credit', end: false, icon: Code2,     label: t('navbar.credit') || 'Credit' },
  ];
}

function NavItem({ to, end, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={({ isActive }) =>
        cn(
          'flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm transition-colors no-underline',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          isActive && 'text-foreground bg-muted'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden whitespace-nowrap 2xl:inline">{label}</span>
    </NavLink>
  );
}

export default function TopMenu() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = buildNavItems(t);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 min-w-0 items-center gap-2 overflow-hidden px-4 xl:gap-3">
        <NavLink to="/" className="flex shrink-0 items-center gap-2 font-semibold text-foreground no-underline hover:no-underline">
          <img src="/favicon-32x32.png" alt="" width="20" height="20" className="shrink-0" />
          <span className="hidden whitespace-nowrap xl:inline">SCP: SL Servers</span>
        </NavLink>

        <nav className="ml-2 hidden min-w-0 shrink-0 items-center gap-1 lg:flex xl:ml-4">
          {items.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>

        <div className="min-w-2 flex-1" />

        <div className="hidden min-w-0 shrink-0 items-center gap-2 lg:flex xl:gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden whitespace-nowrap text-muted-foreground 2xl:inline">{t('navbar.language')}</span>
            <LanguageSelect />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="hidden whitespace-nowrap text-muted-foreground 2xl:inline">{t('navbar.unit')}</span>
            <SiSelect />
          </div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-[300px] flex flex-col">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
            <nav className="flex flex-col gap-1 mt-6">
              {items.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setMobileOpen(false)} />
              ))}
            </nav>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('navbar.language')}</span>
                <LanguageSelect />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t('navbar.unit')}</span>
                <div style={{ minWidth: 140 }}><SiSelect /></div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
