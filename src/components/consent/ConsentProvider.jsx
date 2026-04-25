import { useEffect } from 'react';
import { startSameTabPolling, stopSameTabPolling } from './silktideClient';
import { attachI18nBridge } from './i18nBridge';

export function ConsentProvider({ children }) {
  useEffect(() => {
    startSameTabPolling();
    const detach = attachI18nBridge();
    return () => {
      stopSameTabPolling();
      detach();
    };
  }, []);

  return children;
}
