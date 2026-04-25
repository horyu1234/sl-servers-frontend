import i18n from '../../i18n/i18n';

// Pushes localized banner copy into Silktide whenever i18n.language changes.
// Reuses the existing 27-locale `cookie-notice` keys.
//
// The Silktide script is `<script defer>` in index.html, so it loads after
// HTML parse — racing React's first useEffect. If the global isn't ready
// yet, retry every 200ms (capped at 10 attempts) until it is.
//
// Note: acceptButtonText and rejectButtonText intentionally share the
// `cookie-notice.dismiss` key — the legacy banner had only one button and
// no separate "reject" copy exists across the 27 locales. If a future
// translation pass adds `cookie-notice.reject`, swap it in here.
const MAX_RETRIES = 10;
const RETRY_INTERVAL_MS = 200;

export function attachI18nBridge() {
  let retryHandle = null;
  let attempts = 0;

  function push() {
    const cmp = window.silktideCookieBannerManager;
    if (!cmp || typeof cmp.updateCookieBannerConfig !== 'function') {
      attempts += 1;
      if (attempts > MAX_RETRIES || retryHandle != null) return;
      retryHandle = setTimeout(() => {
        retryHandle = null;
        push();
      }, RETRY_INTERVAL_MS);
      return;
    }
    attempts = 0;
    cmp.updateCookieBannerConfig({
      text: {
        bannerTitle: i18n.t('cookie-notice.message'),
        acceptButtonText: i18n.t('cookie-notice.dismiss'),
        rejectButtonText: i18n.t('cookie-notice.dismiss'),
      },
    });
  }

  push();
  i18n.on('languageChanged', push);
  return () => {
    if (retryHandle != null) {
      clearTimeout(retryHandle);
      retryHandle = null;
    }
    i18n.off('languageChanged', push);
  };
}
