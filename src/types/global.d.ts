// Globals that third-party scripts share with the consent gates.

/** Queues calls until the remote script takes over and replays `q`. */
interface ScriptQueue {
  (...args: unknown[]): void;
  q?: IArguments[];
}

/** The AdSense queue: a plain array until the remote script replaces it with its own object. */
interface AdsQueue {
  push(params: object): unknown;
  /** 1 asks for ads that are not personalised. It applies to the requests made after it is set. */
  requestNonPersonalizedAds?: 0 | 1;
}

interface Window {
  adsbygoogle?: AdsQueue;
  dataLayer?: unknown[];
  clarity?: ScriptQueue;
  MineTalk?: ScriptQueue;
}
