/**
 * How long a call to the mailroom service may take before the API gives up and answers 504 (#2277): 10 seconds.
 *
 * Sending a mail through mailroom normally takes well under a second, and the largest request, the helper forwarding a
 * message with its attachments (up to 50 MiB), crosses the internal network in a few. Ten seconds leaves room for a
 * slow moment without letting a mailroom that never answers hold a visitor's request open for ever, as it could.
 *
 * `MAILROOM_TIMEOUT_MS` overrides it, for tests and for an environment that needs longer.
 */
export const MAILROOM_TIMEOUT_MS = 10_000;

/** The timeout in force: `MAILROOM_TIMEOUT_MS` when set to a positive number, otherwise the default. */
export function mailroomTimeout(): number {
  const configured = Number(process.env.MAILROOM_TIMEOUT_MS);

  return configured > 0 ? configured : MAILROOM_TIMEOUT_MS;
}

/**
 * got's options for every mailroom call: the timeout on the whole request. got never retries a POST, so a mail is not
 * sent twice.
 */
export function mailroomRequestOptions() {
  return { timeout: { request: mailroomTimeout() } };
}

/** Whether a failed mailroom call gave up waiting (got's `TimeoutError`, code `ETIMEDOUT`). */
export function isMailroomTimeout(error: unknown): boolean {
  const e = error as { name?: string; code?: string };

  return e?.name === 'TimeoutError' || e?.code === 'ETIMEDOUT';
}
