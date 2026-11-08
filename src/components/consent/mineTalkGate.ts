import i18n from '../../i18n/i18n';
import { readConsent, subscribe } from './silktideClient';

const WIDGET_KEY = 'wgt_jCmOSJB4SiyGmYwR';
let scriptInjected = false;
let booted = false;

export function isBooted() {
  return booted;
}

// The widget UI ships ko/en/ja/zh-CN/zh-TW and silently falls back to Korean
// for anything else, so every other site language has to map to English here.
export function toWidgetLocale(language = '') {
  if (language.startsWith('ko')) return 'ko';
  if (language === 'zh-CN') return 'zh-CN';
  // zh-TW and zh-LZH both use traditional script.
  if (language.startsWith('zh')) return 'zh-TW';
  return 'en';
}

function injectScript() {
  // Equivalent to the official install snippet, inlined so the script only
  // loads after consent. Calls made before embed.js finishes loading are
  // queued in `q`, which the SDK replays in order.
  const queue: ScriptQueue = function () {
    // q is set right below, before anything can call the queue.
    queue.q!.push(arguments);
  };
  queue.q = [];
  window.MineTalk = queue;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://app.mine.talk/widget/${WIDGET_KEY}/embed.js`;
  document.head.appendChild(script);

  scriptInjected = true;
}

// The widget reports page views and visitor details to MineTalk as soon as it
// boots, so it stays behind the same consent the banner promises.
function evaluate() {
  const { granted } = readConsent('functional');

  if (granted && !booted) {
    if (!scriptInjected) injectScript();
    // injectScript above has set it, and the SDK replaces it with its own function.
    window.MineTalk!('boot', {
      widgetKey: WIDGET_KEY,
      locale: toWidgetLocale(i18n.resolvedLanguage),
    });
    booted = true;
  } else if (!granted && booted) {
    // Not `shutdown`: when ending the session fails it only hides the widget,
    // which keeps reporting page views and blocks the next boot.
    window.MineTalk!('unmount', { widgetKey: WIDGET_KEY });
    booted = false;
  }
}

try {
  evaluate();
  subscribe(evaluate);
} catch (e) {
  // Support chat failed to load; the app must still boot.
  // eslint-disable-next-line no-console
  console.warn('[mineTalkGate] failed to initialise consent gate:', e);
}
