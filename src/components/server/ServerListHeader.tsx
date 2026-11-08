import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { SORT_OPTIONS } from '../filters/filterSchema';
import { SERVER_ROW_GRID } from './serverRowGrid';
import { cn } from '@/lib/cn';
import type { ServerSortType } from '../../types/api';

interface ServerListHeaderProps {
  sort: ServerSortType;
  onSortChange: (sort: ServerSortType) => void;
}

interface SortHeaderProps extends ServerListHeaderProps {
  label: ReactNode;
  primary: ServerSortType;
  secondary: ServerSortType;
}

function SortHeader({ label, primary, secondary, sort, onSortChange }: SortHeaderProps) {
  const { t } = useTranslation();
  const active = sort === primary || sort === secondary;
  const next = sort === primary ? secondary : primary;
  // SORT_OPTIONS lists every ServerSortType.
  const nextOption = SORT_OPTIONS.find((opt) => opt.value === next)!;
  const Icon = !active ? ArrowUpDown : sort.endsWith('_ASC') ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSortChange(next)}
      aria-pressed={active}
      title={t(nextOption.i18nKey)}
      className={cn(
        'inline-flex min-w-0 items-center gap-1 rounded-sm text-left transition-colors hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active && 'text-foreground'
      )}
    >
      <span className="truncate">{label}</span>
      <Icon className={cn('h-3 w-3 shrink-0', !active && 'opacity-60')} aria-hidden="true" />
    </button>
  );
}

export function ServerListHeader({ sort, onSortChange }: ServerListHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('grid items-center gap-3 border-t border-border px-4 py-2 text-xs font-medium text-muted-foreground', SERVER_ROW_GRID)}>
      <span className="truncate">{t('server-list.columns.server')}</span>
      <span className="truncate">{t('filter-option.country')}</span>
      <span className="hidden truncate min-[1440px]:block">{t('server-list.columns.address')}</span>
      <span className="truncate">{t('server-list.columns.trend')}</span>
      <SortHeader
        label={t('server-info.players')}
        primary="PLAYERS_DESC"
        secondary="PLAYERS_ASC"
        sort={sort}
        onSortChange={onSortChange}
      />
      <SortHeader
        label={t('server-info.distance')}
        primary="DISTANCE_ASC"
        secondary="DISTANCE_DESC"
        sort={sort}
        onSortChange={onSortChange}
      />
      <span aria-hidden="true" />
    </div>
  );
}

export default ServerListHeader;
