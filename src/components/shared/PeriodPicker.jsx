import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';

const PERIODS = [
  { id: '1hour',  seconds: 3600 },
  { id: '8hour',  seconds: 8 * 3600 },
  { id: '1day',   seconds: 86_400 },
  { id: '2day',   seconds: 2 * 86_400 },
  { id: '1week',  seconds: 7 * 86_400 },
  { id: '1month', seconds: 30 * 86_400 },
  { id: '3month', seconds: 90 * 86_400 },
  { id: '1year',  seconds: 365 * 86_400 },
  { id: '4year',  seconds: 4 * 365 * 86_400 },
  { id: 'custom', seconds: 0 },
];

const SECONDS_8_HOURS = 8 * 3600;
const SECONDS_1_WEEK  = 7 * 86_400;
const SECONDS_3_MONTH = 90 * 86_400;

function resolutionsFor(seconds) {
  const out = ['1d'];
  if (seconds <= SECONDS_3_MONTH) out.unshift('1h');
  if (seconds <= SECONDS_1_WEEK)  out.unshift('5m');
  if (seconds <= SECONDS_8_HOURS) out.unshift('1m');
  return out;
}

function durationOf(periodId, start, stop) {
  if (periodId === 'custom') return Math.max(0, (stop.getTime() - start.getTime()) / 1000);
  return PERIODS.find((p) => p.id === periodId)?.seconds ?? 0;
}

export function PeriodPicker({ onUpdate }) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('1week');
  const [start, setStart] = useState(new Date(Date.now() - SECONDS_1_WEEK * 1000));
  const [stop, setStop] = useState(new Date());
  const [resolution, setResolution] = useState('5m');

  const seconds = useMemo(() => durationOf(period, start, stop), [period, start, stop]);
  const resolutions = useMemo(() => resolutionsFor(seconds), [seconds]);

  useEffect(() => {
    if (!resolutions.includes(resolution)) setResolution(resolutions[0]);
  }, [resolutions, resolution]);

  const submit = () => {
    if (period === 'custom') {
      if (start.getTime() >= stop.getTime()) {
        toast.warning('Start time must be before stop time.');
        return;
      }
      onUpdate({ aggregateEvery: resolution, startTime: start.toISOString(), stopTime: stop.toISOString() });
    } else {
      onUpdate({ aggregateEvery: resolution, startTime: `-${seconds}s` });
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('server-info.graph.options.data-range')}
        </Label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {period === 'custom' && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('server-info.graph.options.start-time')}
            </Label>
            <DateTrigger value={start} onChange={setStart} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('server-info.graph.options.stop-time')}
            </Label>
            <DateTrigger value={stop} onChange={setStop} />
          </div>
        </>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {t('server-info.graph.options.data-resolution')}
        </Label>
        <Select value={resolution} onValueChange={setResolution}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resolutions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={submit} size="default" className="ml-1 gap-2 h-9 px-4 shadow-sm">
        <RefreshCw className="h-4 w-4" />
        {t('server-info.graph.options.graph-update-btn')}
      </Button>
    </div>
  );
}

function DateTrigger({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const handleSelect = (d) => {
    if (!d) return;
    // Preserve the time-of-day from the previous value so picking a date
    // doesn't silently zero the clock.
    const next = new Date(d);
    next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(next);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-start gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{format(value, 'yyyy-MM-dd HH:mm')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 space-y-2 p-3" align="start">
        <Calendar mode="single" selected={value} onSelect={handleSelect} />
        <div className="flex items-center gap-2 px-1 pb-1">
          <Label className="text-xs text-muted-foreground">Time</Label>
          <input
            type="time"
            value={format(value, 'HH:mm')}
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map((n) => Number.parseInt(n, 10));
              if (Number.isNaN(h) || Number.isNaN(m)) return;
              const next = new Date(value);
              next.setHours(h, m, 0, 0);
              onChange(next);
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default PeriodPicker;
