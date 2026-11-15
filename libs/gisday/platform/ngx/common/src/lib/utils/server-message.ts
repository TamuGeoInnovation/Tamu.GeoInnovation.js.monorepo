/**
 * The API's own reason for refusing a request, else `fallback` (#2966).
 *
 * A Nest error body is `{ statusCode, message, error }`, where `message` is one string ("The photo must be a PNG or
 * JPEG image", "Submissions closed on …" from #2934) or, from validation, a list of them. Only a refusal (4xx) is
 * read: a 5xx message such as "Internal server error" is not a reason anyone can act on, and a body that is text,
 * such as a proxy's 413 page, has no message. Accepts anything a subscription's `error` callback is given.
 */
export function serverMessage(err: unknown, fallback: string): string {
  const response = err as { status?: unknown; error?: unknown } | null | undefined;
  const status = response?.status;

  if (typeof status !== 'number' || status < 400 || status >= 500) {
    return fallback;
  }

  const body = response.error;
  const message = body !== null && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
  const lines = (Array.isArray(message) ? message : [message]).filter(
    (line): line is string => typeof line === 'string' && line.trim().length > 0
  );

  return lines.length > 0 ? lines.join('; ') : fallback;
}
