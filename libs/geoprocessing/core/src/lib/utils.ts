const OPEN = '<QueryStatusCodeValue>';
const CLOSE = '</QueryStatusCodeValue>';

/**
 * The status code in a geoservices XML answer, or NaN when it has none. Read by position rather than with a lazy pattern,
 * which backtracked polynomially on a long answer of unclosed tags (CodeQL js/polynomial-redos, #3776). The pattern also
 * returned the whole match rather than the number, so every answer read as NaN, and one with no code threw a TypeError.
 */
export function getXmlStatusCode(xml: string): number {
  const start = xml.indexOf(OPEN);
  const end = start === -1 ? -1 : xml.indexOf(CLOSE, start + OPEN.length);

  return end === -1 ? NaN : parseInt(xml.slice(start + OPEN.length, end), 10);
}
