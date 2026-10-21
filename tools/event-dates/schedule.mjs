/**
 * Reading home dates out of an athletics schedule page (#2019).
 *
 * The pages at `12thman.com/sports/<sport>/schedule` are server-rendered: the whole season is in the
 * HTML. No API key, no browser, no scraping framework - one fetch per sport.
 *
 * Each game carries its venue on the date element as
 * `schedule-event-date--venue-home|away|neutral`, followed by `<time datetime="2026-11-02T19:00:00...">`.
 * Every game is rendered twice, once for the grid view and once for the list view, so the markers are
 * counted and then deduplicated by date rather than trusted as one-per-game.
 *
 * Deliberately not a DOM parser: the markers are unambiguous, and a regular expression over the
 * response cannot execute anything the page sends. If the site's markup changes, this stops finding
 * games and says so loudly - see `parseSchedule`'s empty-result handling in `check.mjs` - rather than
 * quietly reporting a season with no home games, which would read exactly like a stale definition.
 */

/** A venue marker, and the ISO date of the `<time>` that follows it. */
const GAME = /schedule-event-date--venue-(home|away|neutral)[\s\S]{0,600}?datetime="(\d{4}-\d{2}-\d{2})/g;

/**
 * Every distinct home date on a schedule page, sorted.
 *
 * @param {string} html the page's HTML
 * @returns {{ home: string[]; away: number; neutral: number; games: number }}
 */
export function parseSchedule(html) {
  const home = new Set();
  const away = new Set();
  const neutral = new Set();

  for (const [, venue, date] of html.matchAll(GAME)) {
    if (venue === 'home') {
      home.add(date);
    } else if (venue === 'away') {
      away.add(date);
    } else {
      neutral.add(date);
    }
  }

  return {
    home: [...home].sort(),
    away: away.size,
    neutral: neutral.size,
    games: home.size + away.size + neutral.size
  };
}

/**
 * Fetches a schedule page.
 *
 * A non-200, or a page with no games of any kind, throws: both mean "we do not know this sport's
 * dates", and reporting that as "no home games" would be indistinguishable from a season that really
 * has none.
 *
 * @param {string} url
 */
export async function fetchSchedule(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'aggiemap-event-dates (+docs/testing.md)' } });

  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }

  const parsed = parseSchedule(await response.text());

  if (parsed.games === 0) {
    throw new Error(
      `${url} returned a page with no games in it. Either the season is not published yet, or the ` +
        `markup this reads (schedule-event-date--venue-*) has changed.`
    );
  }

  return parsed;
}
