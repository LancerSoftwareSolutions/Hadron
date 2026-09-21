// Only allows a plain path on this same site, such as "/en/business".
// Rejects anything that a browser could read as another website: "//evil.com", "/\evil.com",
// a full "https://..." address, "javascript:...", and hidden tabs or line breaks.
export function safePath(next: string | null | undefined): string | null {
  if (!next) return null
  if (!next.startsWith('/') || next.startsWith('//')) return null
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return null
  return next
}
