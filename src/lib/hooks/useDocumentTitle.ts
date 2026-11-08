import { useEffect } from 'react';

const SITE_NAME = 'SCP: Secret Laboratory Server List';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}

export default useDocumentTitle;
