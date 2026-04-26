import React from 'react';

// Country flag SVG served from the public country-flag-icons CDN.
// 3:2 aspect ratio. We render at 18x12 by default which matches the
// surrounding text-[11px] line height on the row.
const FLAG_BASE = 'https://purecatamphetamine.github.io/country-flag-icons/3x2';

export function CountryFlag({ isoCode, className = '', width = 18, height = 12 }) {
  if (typeof isoCode !== 'string' || isoCode.length !== 2) return null;
  const upper = isoCode.toUpperCase();
  return (
    <img
      src={`${FLAG_BASE}/${upper}.svg`}
      alt={upper}
      width={width}
      height={height}
      loading="lazy"
      className={className}
    />
  );
}

export default CountryFlag;
