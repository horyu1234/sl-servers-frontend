import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { LocaleLink } from '../shell/LocaleLink';
import { AD_CLIENT, adsUnanswered, getAdsStatus, isLive, noteAdAnswer, requestAd, startAds, subscribeAds } from './loader';
import { pathOf } from '../../site/routes';
import { cn } from '@/lib/cn';

interface AdSize {
  width: number;
  height: number;
}

// The widest size that fits is used. Each list ends with the size for a phone.
const BANNER: AdSize[] = [{ width: 728, height: 90 }, { width: 468, height: 60 }];

// One AdSense ad unit per kind of page, so the reports tell them apart.
const PLACEMENTS = {
  /** Above the server list. The list is what people come for, so a phone gets the lowest banner. */
  list: { slot: '4813362376', sizes: [...BANNER, { width: 320, height: 50 }] },
  /** On a server's page, between its summary and its graph. */
  server: { slot: '7545843639', sizes: [...BANNER, { width: 320, height: 100 }] },
  /** On the statistics and content pages, between the charts and the tables. */
  page: { slot: '9682545679', sizes: [...BANNER, { width: 320, height: 100 }] },
} satisfies Record<string, { slot: string; sizes: AdSize[] }>;

export type AdPlacement = keyof typeof PLACEMENTS;

/**
 * What the page around the slot has to show. An ad is only asked for next to content:
 * `pending` keeps the room while the content loads, `missing` gives the room up.
 */
export type AdContent = 'shown' | 'pending' | 'missing';

/**
 * What became of the request. `late` is no answer after ANSWER_WAIT_MS: the slot closes, and
 * opens again if the ad still comes. `none` is final: no ad, or an ad blocker hid the element.
 */
type AdAnswer = 'waiting' | 'filled' | 'late' | 'none';

// Long enough for a slow connection. Google's own consent message also holds the request back
// while it is open, which is why a late slot can still open.
const ANSWER_WAIT_MS = 5000;

function pickSize(sizes: AdSize[], room: number) {
  return sizes.find((size) => size.width <= room) ?? sizes[sizes.length - 1];
}

interface AdSlotProps {
  placement: AdPlacement;
  content?: AdContent;
  className?: string;
}

function Slot({ placement, content = 'shown', className }: AdSlotProps) {
  const { t } = useTranslation();
  const status = useSyncExternalStore(subscribeAds, getAdsStatus);
  const live = isLive();
  const { slot, sizes } = PLACEMENTS[placement];

  const frameRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const requested = useRef(false);
  const [asked, setAsked] = useState(false);
  const [size, setSize] = useState<AdSize | null>(null);
  const [answer, setAnswer] = useState<AdAnswer>(() => (adsUnanswered() ? 'late' : 'waiting'));

  const visible = content !== 'missing' && status !== 'blocked' && answer !== 'none';
  // A closed slot keeps its element laid out at full size, because the script refuses to
  // request an ad for an element that is not displayed. The element is taken out of the page's
  // flow and clipped, which leaves an empty box that takes no room and adds no gap.
  const closed = answer === 'late';

  // The size is chosen once, from the room the slot has, and set on the element itself: the
  // script reads the element's size when the ad is requested and does not follow it afterwards.
  useLayoutEffect(() => {
    if (!visible || size || !frameRef.current) return;
    setSize(pickSize(sizes, frameRef.current.getBoundingClientRect().width));
  }, [visible, size, sizes]);

  useEffect(() => {
    if (live && content === 'shown') startAds();
  }, [live, content]);

  // One request for each element. The ref guards it, because StrictMode runs an effect twice
  // before the state below has changed.
  useEffect(() => {
    if (!live || !visible || content !== 'shown' || !insRef.current || requested.current) return;
    if (status !== 'loading' && status !== 'ready') return;
    requested.current = true;
    requestAd();
    setAsked(true);
  }, [live, visible, content, status, size]);

  useEffect(() => {
    const ins = insRef.current;
    if (!ins) return undefined;

    // AdSense marks the element once its request is done.
    const marks = new MutationObserver(() => {
      const mark = ins.dataset.adStatus;
      if (mark !== 'filled' && mark !== 'unfilled') return;
      noteAdAnswer(true);
      setAnswer(mark === 'filled' ? 'filled' : 'none');
    });
    marks.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });

    // An ad blocker that lets the script through may still hide the element.
    const hidden = new ResizeObserver(() => {
      if (getComputedStyle(ins).display === 'none') setAnswer('none');
    });
    hidden.observe(ins);

    return () => {
      marks.disconnect();
      hidden.disconnect();
    };
  }, [size]);

  // The wait starts once the script is here: before that the request only sits in its queue.
  useEffect(() => {
    if (status !== 'ready' || answer !== 'waiting' || !asked) return undefined;
    const timer = setTimeout(() => {
      noteAdAnswer(false);
      setAnswer((now) => (now === 'waiting' ? 'late' : now));
    }, ANSWER_WAIT_MS);
    return () => clearTimeout(timer);
  }, [status, answer, asked]);

  return (
    <div
      ref={frameRef}
      hidden={!visible}
      className={cn('relative w-full', className)}
      // Set here and not as a class, so it wins over the margins the page gives the slot.
      style={closed ? { margin: 0 } : undefined}
    >
      {size && (
        <div
          className="overflow-hidden"
          style={closed ? { position: 'absolute', inset: '0 0 auto 0', height: 0, visibility: 'hidden' } : undefined}
        >
          <div className="mx-auto" style={{ width: size.width }}>
            {/* The link is easy to hit from above and from the sides, and its lower edge stays
                clear of the ad, so reaching for one never lands on the other. */}
            <div className="mb-2.5 flex items-center gap-1 text-[11px] leading-4 text-muted-foreground">
              <span>{t('funding.label')}</span>
              <LocaleLink
                to={pathOf('funding')}
                aria-label={t('funding.why')}
                title={t('funding.why')}
                className="-mx-2 -mt-2 rounded px-2 pt-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </LocaleLink>
            </div>
            {live ? (
              <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block', width: size.width, height: size.height }}
                data-ad-client={AD_CLIENT}
                data-ad-slot={slot}
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-md border border-dashed border-border text-xs tabular-nums text-muted-foreground"
                style={{ height: size.height }}
              >
                {size.width} × {size.height}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One ad, with its label and the link to the page that explains why the site has ads.
 *
 * A page shows one slot at most, and never where there is no content: not on a 404, a loading
 * screen or an error. Outside the live site it draws a box of the ad's size.
 */
export function AdSlot(props: AdSlotProps) {
  // A new page gets a new ad. Filters and tabs only change the query or the fragment, and the
  // ad stays: asking again there would be refreshing it.
  const { pathname } = useLocation();
  return <Slot key={pathname} {...props} />;
}

export default AdSlot;
