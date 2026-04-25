import { useSyncExternalStore } from 'react';
import { readConsent, subscribe } from './silktideClient';

export function useConsent(category) {
  return useSyncExternalStore(
    subscribe,
    () => readConsent(category),
    () => ({ granted: false, status: 'unknown' }) // SSR/initial
  );
}
