import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobalHistoryChart } from './GlobalHistoryChart';
import { StatTile } from '../shared/StatTile';
import { getGlobalHistoryAPI } from '../../lib/api/stats';
import { useApiResource } from '../../lib/hooks/useApiResource';
import { majorReleases, signedPercent, totalGapDays } from '../../lib/insights/history';

function StandingTiles({ latest, todayPeakSoFar }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatTile
        label={t('insights.global.latest')}
        value={t('insights.players', { players: latest.peak.toLocaleString() })}
        note={t('insights.global.utc-date', { date: latest.date })}
      />
      <StatTile
        label={t('insights.global.rank')}
        value={t('insights.global.rank-value', { rank: latest.rank.toLocaleString() })}
        note={t('insights.global.rank-note', {
          days: latest.totalDays.toLocaleString(),
          percent: latest.lowerDaysPercent,
        })}
      />
      {latest.yearAgoChangePercent !== null && (
        <StatTile
          label={t('insights.global.year-ago')}
          value={signedPercent(latest.yearAgoChangePercent)}
          note={t('insights.global.year-ago-note', {
            date: latest.yearAgoDate,
            players: latest.yearAgoPeak.toLocaleString(),
          })}
        />
      )}
      {todayPeakSoFar !== null && (
        <StatTile
          label={t('insights.global.today')}
          value={t('insights.players', { players: todayPeakSoFar.toLocaleString() })}
          note={t('insights.global.today-note')}
        />
      )}
    </div>
  );
}

function RecordList({ records }) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{t('insights.global.records')}</h3>
      <ol className="divide-y divide-border">
        {records.map((record, index) => (
          <li key={record.date} className="flex items-baseline gap-3 py-2 text-sm">
            <span className="w-4 shrink-0 tabular-nums text-muted-foreground">{index + 1}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {t('insights.players', { players: record.peak.toLocaleString() })}
            </span>
            <span className="min-w-0 flex-1 truncate text-right text-xs tabular-nums text-muted-foreground">
              {record.date}
              {record.version && ` · ${t('insights.global.record-near-release', { version: record.version })}`}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ReleaseTable({ releases }) {
  const { t } = useTranslation();
  const majors = majorReleases(releases);

  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{t('insights.global.releases')}</h3>
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th scope="col" className="py-1.5 pr-3 font-normal">{t('insights.global.release-version')}</th>
            <th scope="col" className="py-1.5 pr-3 font-normal">{t('insights.global.release-date')}</th>
            <th scope="col" className="hidden py-1.5 pr-3 text-right font-normal sm:table-cell">{t('insights.global.release-before')}</th>
            <th scope="col" className="hidden py-1.5 pr-3 text-right font-normal sm:table-cell">{t('insights.global.release-after')}</th>
            <th scope="col" className="py-1.5 text-right font-normal">{t('insights.global.release-change')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {majors.map((release) => (
            <tr key={release.version}>
              <th scope="row" className="py-2 pr-3 text-left font-medium text-foreground">{release.version}</th>
              <td className="py-2 pr-3 text-muted-foreground">{release.date}</td>
              <td className="hidden py-2 pr-3 text-right text-muted-foreground sm:table-cell">{release.peakBefore?.toLocaleString() ?? '—'}</td>
              <td className="hidden py-2 pr-3 text-right text-muted-foreground sm:table-cell">{release.peakAfter?.toLocaleString() ?? '—'}</td>
              <td className="py-2 text-right text-foreground">{signedPercent(release.changePercent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">{t('insights.global.release-caveat')}</p>
    </div>
  );
}

export function GlobalHistorySection() {
  const { t } = useTranslation();
  const { status, data } = useApiResource(getGlobalHistoryAPI, 'global-history');

  if (status === 'loading') {
    return <Skeleton className="mb-4 h-96 w-full rounded-lg" role="status" aria-label={t('insights.loading')} />;
  }
  if (status === 'unavailable' || data.daily.length === 0) return null;

  return (
    <Card className="mb-4 min-w-0">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle>{t('insights.global.title')}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('insights.global.description', { date: data.daily[0].date })}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 p-4 pt-0 sm:p-5 sm:pt-0">
        {data.latest && <StandingTiles latest={data.latest} todayPeakSoFar={data.todayPeakSoFar} />}
        <div>
          <GlobalHistoryChart history={data} />
          <p className="mt-2 text-xs text-muted-foreground">
            {t('insights.global.chart-note', { days: totalGapDays(data.gaps) })}
          </p>
        </div>
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <RecordList records={data.records} />
          <ReleaseTable releases={data.releases} />
        </div>
      </CardContent>
    </Card>
  );
}

export default GlobalHistorySection;
