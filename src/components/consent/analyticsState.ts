import { isInitialized as gtmInit } from './gtmGate';
import { isInitialized as clarityInit } from './clarityGate';
import { isInitialized as sentryInit } from './sentryGate';

export function wereAnyAnalyticsScriptsLoaded() {
  return gtmInit() || clarityInit() || sentryInit();
}
