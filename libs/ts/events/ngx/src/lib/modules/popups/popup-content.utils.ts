export function normalizePopupContent(content: unknown): string | null {
  if (typeof content !== 'string') {
    return null;
  }

  const normalized = content.replace(/\r\n?/g, '\n').trim();

  return normalized.length > 0 ? normalized : null;
}
