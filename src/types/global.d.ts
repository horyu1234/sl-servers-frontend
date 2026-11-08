// Globals that third-party scripts share with the consent gates.

/** Queues calls until the remote script takes over and replays `q`. */
interface ScriptQueue {
  (...args: unknown[]): void;
  q?: IArguments[];
}

interface Window {
  dataLayer?: unknown[];
  clarity?: ScriptQueue;
  MineTalk?: ScriptQueue;
}
