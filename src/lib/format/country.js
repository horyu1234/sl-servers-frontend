// Convert an ISO-3166-1 alpha-2 country code into the corresponding flag
// emoji ("KR" -> "🇰🇷"). Returns empty string for invalid input.
//
// We use this instead of react-world-flags because that package ships as a
// UMD/CJS bundle whose ESM-interop default export under Vite is a namespace
// object, not a component. Emoji flags also remove a dep and match the
// design mockups.
export function isoToFlagEmoji(isoCode) {
  if (typeof isoCode !== 'string' || isoCode.length !== 2) return '';
  const upper = isoCode.toUpperCase();
  const a = upper.charCodeAt(0);
  const b = upper.charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return '';
  return String.fromCodePoint(0x1F1E6 + a - 65, 0x1F1E6 + b - 65);
}
