import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// SafeHtml renders backend-supplied HTML.
//
// Primary line of defense: the backend sanitizes server.info and
// footer.notice before serving them. SafeHtml is a defense-in-depth
// secondary layer that uses DOMPurify with its default policy:
// <script>, <iframe>, event handlers (onclick=…), javascript: URLs
// are stripped unconditionally. All standard formatting tags AND
// attributes — including `style` for inline color/spacing markup —
// flow through, matching the legacy dangerouslySetInnerHTML callsite.

interface SafeHtmlProps {
  html: string | null | undefined;
  className?: string;
}

export default function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = useMemo(() => DOMPurify.sanitize(html ?? ''), [html]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
