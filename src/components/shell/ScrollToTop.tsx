import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { parsePath } from '../../site/routes';

/**
 * Starts a new page at its top. The router keeps the window where it was scrolled, so without
 * this a link in the footer opens the next page at its bottom.
 *
 * Going back or forward is left to the browser, which remembers where each page was. A change of
 * only the query, the fragment or the language prefix (filters, section menus, the language
 * menu) is the same page and does not move.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const { path } = parsePath(pathname);

  useLayoutEffect(() => {
    if (navigationType !== 'POP' && window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
    // Only when the page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return null;
}
