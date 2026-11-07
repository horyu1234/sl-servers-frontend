import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatTile } from '../shared/StatTile';
import { spanBetween } from '../../lib/insights/history';

function formatSpan(t, { years, months, days }) {
  if (years > 0) return t('insights.history.age-years', { years, months });
  if (months > 0) return t('insights.history.age-months', { months });
  return t('insights.history.age-days', { days });
}

export function ServerHistoryStrip({ history }) {
  const { t } = useTranslation();
  const {
    firstSeenDate, lastSeenDate, trackedSinceCollectionStart,
    peakPlayers, peakDate, versionCount, olderThanOnlinePercent,
  } = history;

  const ageNote = trackedSinceCollectionStart
    ? t('insights.history.age-since-start', { date: firstSeenDate })
    : t('insights.history.age-first-seen', { date: firstSeenDate });

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatTile
        label={t('insights.history.age')}
        value={formatSpan(t, spanBetween(firstSeenDate, lastSeenDate))}
        note={ageNote}
      />
      <StatTile
        label={t('insights.history.peak')}
        value={t('insights.players', { players: peakPlayers.toLocaleString() })}
        note={peakDate}
      />
      <StatTile
        label={t('insights.history.versions')}
        value={t('insights.history.versions-value', { versions: versionCount })}
      />
      {olderThanOnlinePercent !== null && (
        <StatTile
          label={t('insights.history.seniority')}
          value={t('insights.history.seniority-value', { percent: Math.max(1, 100 - olderThanOnlinePercent) })}
          note={t('insights.history.seniority-note')}
        />
      )}
    </div>
  );
}

export default ServerHistoryStrip;
