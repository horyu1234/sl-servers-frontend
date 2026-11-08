import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useConsent } from './useConsent';
import { wereAnyAnalyticsScriptsLoaded } from './analyticsState';

export default function AnalyticsRevokeNotice() {
  const { granted } = useConsent('analytics');
  const { t } = useTranslation();
  const prevGrantedRef = useRef(granted);

  useEffect(() => {
    const wasGranted = prevGrantedRef.current;
    prevGrantedRef.current = granted;

    if (wasGranted && !granted && wereAnyAnalyticsScriptsLoaded()) {
      toast.message(t('consent.revoke.title'), {
        description: t('consent.revoke.description'),
        duration: 10000,
        action: {
          label: t('consent.revoke.reload'),
          onClick: () => window.location.reload(),
        },
      });
    }
  }, [granted, t]);

  return null;
}
