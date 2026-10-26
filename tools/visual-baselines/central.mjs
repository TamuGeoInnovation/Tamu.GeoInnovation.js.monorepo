/**
 * The time now in US Central, named, as everything these tools write is (CLAUDE.md). Shared by
 * capture.mjs (a set's manifest) and review.mjs (a comparison's summary).
 *
 * Intl, not the TZ variable: Git Bash and the Playwright image have no time zone data, and there
 * `TZ=America/Chicago` silently gives UTC.
 */
export const centralNow = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
    .format(date)
    .replace(',', '') + ' US Central';
