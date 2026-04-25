import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED = {
  ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'br', 'span', 'p'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
};

export default function SafeHtml({ html, className }) {
  const clean = useMemo(() => DOMPurify.sanitize(html ?? '', ALLOWED), [html]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
