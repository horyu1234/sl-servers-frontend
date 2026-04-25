import i18n from '../../i18n/i18n';

// Pushes localized banner copy into Silktide whenever i18n.language changes.
// Reuses the existing 27-locale `cookie-notice` keys.
export function attachI18nBridge() {
  function push() {
    const cmp = window.silktideCookieBannerManager;
    if (!cmp || typeof cmp.updateCookieBannerConfig !== 'function') return;
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
  return () => i18n.off('languageChanged', push);
}
