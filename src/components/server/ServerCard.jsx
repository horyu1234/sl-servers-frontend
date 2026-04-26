import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ServerSparkline } from './ServerSparkline';
import { ServerMetaStrip } from './ServerMetaStrip';
import SafeHtml from '../shell/SafeHtml';
import { parsePlayers, playersPercent } from '../../lib/format/players';
import { isoToFlagEmoji } from '../../lib/format/country';
import { cn } from '@/lib/cn';

export function ServerCard({ server, trend }) {
  const navigate = useNavigate();
  const players = parsePlayers(server.players);
  const pct = playersPercent(players);
  const barColor = pct >= 95 ? 'bg-[#ef4444]' : pct >= 80 ? 'bg-[#f59e0b]' : 'bg-primary';

  return (
    <Card
      className="cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => navigate(`/servers/${server.serverId}`)}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="font-medium truncate">
            {server.info
              ? <SafeHtml html={server.info} />
              : `${server.ip}:${server.port}`}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
            <span aria-hidden="true">{isoToFlagEmoji(server.isoCode)}</span>
            <span>{server.isoCode}</span>
          </div>
        </div>
        <ServerMetaStrip server={server} />
        <ServerSparkline data={trend} capacity={players.capacity} current={players.current} />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums pt-1">
          <span className="inline-block flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <span className={cn('block h-full', barColor)} style={{ width: `${pct}%` }} />
          </span>
          <span className="text-foreground/80 whitespace-nowrap">{players.current} / {players.capacity}</span>
        </div>
      </CardContent>
    </Card>
  );
}
