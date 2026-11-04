import { describe, it, expect, beforeEach, vi } from 'vitest';

const KEY = 'silktideCookieChoice_functional';
const CHANGE_EVENT = 'silktide:consentchange';
const WIDGET_KEY = 'wgt_jCmOSJB4SiyGmYwR';
const WIDGET_SRC = `https://app.mine.talk/widget/${WIDGET_KEY}/embed.js`;

function setConsent(value) {
  localStorage.setItem(KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function widgetScripts() {
  return Array.from(document.querySelectorAll('script')).filter(
    (s) => s.src === WIDGET_SRC
  );
}

function queuedCommands() {
  return window.MineTalk.q.map((args) => Array.from(args));
}

const trackedHandlers = { storage: new Set(), [CHANGE_EVENT]: new Set() };
const origAdd = window.addEventListener.bind(window);
window.addEventListener = function (type, handler, ...rest) {
  if (trackedHandlers[type]) trackedHandlers[type].add(handler);
  return origAdd(type, handler, ...rest);
};

describe('mineTalkGate', () => {
  beforeEach(() => {
    for (const [type, set] of Object.entries(trackedHandlers)) {
      for (const h of set) window.removeEventListener(type, h);
      set.clear();
    }
    for (const s of widgetScripts()) s.remove();
    delete window.MineTalk;
    localStorage.clear();
    vi.resetModules();
  });

  it('does not load the widget when consent is unknown', async () => {
    await import('./mineTalkGate');
    expect(widgetScripts()).toHaveLength(0);
    expect(window.MineTalk).toBeUndefined();
  });

  it('does not load the widget when functional consent is denied', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./mineTalkGate');
    expect(widgetScripts()).toHaveLength(0);
  });

  it('does not treat analytics consent as functional consent', async () => {
    localStorage.setItem('silktideCookieChoice_analytics', 'true');
    await import('./mineTalkGate');
    expect(widgetScripts()).toHaveLength(0);
  });

  it('loads and boots the widget once when consent is granted at import', async () => {
    localStorage.setItem(KEY, 'true');
    const mod = await import('./mineTalkGate');
    expect(widgetScripts()).toHaveLength(1);
    expect(mod.isBooted()).toBe(true);
    const commands = queuedCommands();
    expect(commands).toHaveLength(1);
    expect(commands[0][0]).toBe('boot');
    expect(commands[0][1].widgetKey).toBe(WIDGET_KEY);
  });

  it('loads the widget when consent transitions denied -> granted', async () => {
    localStorage.setItem(KEY, 'false');
    await import('./mineTalkGate');
    setConsent(true);
    expect(widgetScripts()).toHaveLength(1);
    expect(queuedCommands()[0][0]).toBe('boot');
  });

  it('unmounts the widget when consent is revoked', async () => {
    localStorage.setItem(KEY, 'true');
    const mod = await import('./mineTalkGate');
    setConsent(false);
    expect(mod.isBooted()).toBe(false);
    expect(queuedCommands()[1]).toEqual(['unmount', { widgetKey: WIDGET_KEY }]);
  });

  it('boots again without a second script after consent is re-granted', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./mineTalkGate');
    setConsent(false);
    setConsent(true);
    expect(widgetScripts()).toHaveLength(1);
    expect(queuedCommands().map(([command]) => command)).toEqual(['boot', 'unmount', 'boot']);
  });

  it('does not reboot on unrelated consent changes', async () => {
    localStorage.setItem(KEY, 'true');
    await import('./mineTalkGate');
    window.dispatchEvent(new Event(CHANGE_EVENT));
    expect(queuedCommands()).toHaveLength(1);
  });

  it('maps site languages to locales the widget supports', async () => {
    const { toWidgetLocale } = await import('./mineTalkGate');
    expect(toWidgetLocale('ko-KR')).toBe('ko');
    expect(toWidgetLocale('en-US')).toBe('en');
    expect(toWidgetLocale('zh-CN')).toBe('zh-CN');
    expect(toWidgetLocale('zh-TW')).toBe('zh-TW');
    expect(toWidgetLocale('zh-LZH')).toBe('zh-TW');
    expect(toWidgetLocale('ru-RU')).toBe('en');
    expect(toWidgetLocale(undefined)).toBe('en');
  });
});
