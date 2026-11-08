import { useSyncExternalStore } from 'react';
import { readConsent, subscribe } from './silktideClient';
import type { Consent, ConsentCategory } from './silktideClient';

export function useConsent(category: ConsentCategory) {
  return useSyncExternalStore(
    subscribe,
    () => readConsent(category),
    (): Consent => ({ granted: false, status: 'unknown' }) // SSR/initial
  );
}
