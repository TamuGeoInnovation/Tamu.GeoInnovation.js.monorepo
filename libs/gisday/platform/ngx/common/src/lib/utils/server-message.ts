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

  if (!response || typeof status !== 'number' || status < 400 || status >= 500) {
    return fallback;
  }

  const body = response.error;
  const message = body !== null && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
  const lines = (Array.isArray(message) ? message : [message]).filter(
    (line): line is string => typeof line === 'string' && line.trim().length > 0
  );

  return lines.length > 0 ? lines.join('; ') : fallback;
}

/**
 * Why an admin page could not read what it shows (#3038), or null when trying again is the right advice. A 403 means the
 * account lacks a permission: the API names it, and trying again can never help (read:checkins, 15 November 2026). A
 * 401 means the sign-in has run out.
 */
export function readRefusal(err: unknown): string | null {
  const status = (err as { status?: unknown } | null | undefined)?.status;

  if (status === 401) {
    return 'Your sign-in has run out. Sign out and sign back in, then open this page again.';
  }

  if (status === 403) {
    const fallback =
      "Your account doesn't have the permission this page needs. An administrator gives it in Auth0; then sign out and sign back in.";
    const named = serverMessage(err, fallback);

    // Nest's bare 403 says only "Forbidden", which names nothing: an older API, or an account with no permissions.
    return /^forbidden\.?$/i.test(named.trim()) ? fallback : named;
  }

  return null;
}
