import React, { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';

// SafeHtml renders backend-supplied HTML with DOMPurify's default policy:
// - <script>, <iframe>, event handlers (onclick=…), javascript: URLs are
//   stripped unconditionally. (DOMPurify default behavior; not configurable.)
// - All standard text/formatting tags are kept (font, b, i, span, color,
//   div, ul, etc.) so SCP:SL server names with rich-text color markup
//   render the same as the legacy dangerouslySetInnerHTML callsite.
// - The `style` attribute is stripped because it allows CSS exfiltration
//   via background-image:url(...).
const CONFIG = { FORBID_ATTR: ['style'] };

export default function SafeHtml({ html, className }) {
  const clean = useMemo(() => DOMPurify.sanitize(html ?? '', CONFIG), [html]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
