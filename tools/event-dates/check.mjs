/**
 * Do the maps' event dates still match what the athletics site publishes? (#2019)
 *
 * On 20 October 2026, **eighteen live maps had every `eventDates` entry in the past**, each one showing
 * visitors a "This event has passed" dialog. It was noticed because one of them - Women's Basketball -
 * happened to be looked at for another reason, two weeks before that season started. Nothing would have
 * caught the other seventeen.
 *
 * This reports; it changes nothing. A wrong parse that rewrote a definition would put wrong dates on a
 * live map, which is worse than the problem. Someone reads the table and makes the change.
 *
 *   node tools/event-dates/check.mjs            every map with a 12thman schedule
 *   node tools/event-dates/check.mjs --all      and the maps whose dates come from elsewhere
 *   node tools/event-dates/check.mjs --json     the same as JSON, for a scheduled run
 *
 * Exit code: 1 if any map is stale (every date in the past) or disagrees with its published schedule,
 * 0 otherwise. So it can be run on a schedule and only speak up when something needs doing.
 */

import { readDefinitions } from './definitions.mjs';
import { fetchSchedule } from './schedule.mjs';

const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');
const includeAll = args.has('--all');

/** Only the athletics site is machine-readable; the rest are human pages. */
const SCRAPEABLE = /^https:\/\/12thman\.com\/sports\/[a-z-]+\/schedule/;

const today = new Date().toISOString().slice(0, 10);

const maps = readDefinitions();

/**
 * Maps that read the same schedule page as another map.
 *
 * A `scheduleUrl` says *where a visitor finds the schedule*, not *these are my dates*, and three pages
 * are shared: football by Football Parking and the Maroon & White spring game, softball by Softball
 * Parking and Softball Regionals, track by the indoor and outdoor track maps. Which published dates
 * belong to which map cannot be told from the page, so a difference there is reported as needing a
 * person rather than as dates to copy across, and does not fail the run.
 */
const sharedSchedules = new Map();
for (const map of maps) {
  if (!map.schedule) continue;
  sharedSchedules.set(map.schedule, [...(sharedSchedules.get(map.schedule) ?? []), map.id]);
}

const rows = [];

for (const map of maps) {
  const dates = map.dates.map((d) => d.iso).sort();
  const malformed = map.dates.filter((d) => d.raw !== d.iso).map((d) => d.raw);
  const last = dates[dates.length - 1] ?? null;
  const stale = Boolean(last) && last < today && !map.retired;

  const row = {
    id: map.id,
    retired: map.retired,
    dates: dates.length,
    first: dates[0] ?? null,
    last,
    stale,
    malformed,
    schedule: map.schedule,
    scheduleExpression: map.scheduleExpression,
    sharedWith: [],
    published: null,
    missing: [],
    extra: [],
    note: null
  };

  if (map.scheduleExpression) {
    row.note = `scheduleUrl is ${map.scheduleExpression}, not a literal — cannot be read from the source`;
  } else if (map.schedule && SCRAPEABLE.test(map.schedule)) {
    row.sharedWith = (sharedSchedules.get(map.schedule) ?? []).filter((id) => id !== map.id);

    try {
      const schedule = await fetchSchedule(map.schedule);
      row.published = schedule.home;
      row.missing = schedule.home.filter((d) => !dates.includes(d));
      row.extra = dates.filter((d) => !schedule.home.includes(d));
    } catch (error) {
      row.note = error.message;
    }
  } else if (map.schedule) {
    row.note = 'schedule is a human page, not the athletics site';
  }

  rows.push(row);
}

const checked = rows.filter((r) => r.published);
const relevant = includeAll ? rows : rows.filter((r) => r.published || r.scheduleExpression);

if (asJson) {
  console.log(JSON.stringify({ today, rows: relevant }, null, 1));
} else {
  const pad = (s, n) => String(s ?? '-').padEnd(n);
  console.log(`Event dates against the published schedules, ${today}\n`);
  console.log(pad('map', 26), pad('dates', 6), pad('last', 11), pad('published', 10), 'state');

  for (const r of relevant) {
    const state = r.retired
      ? 'retired'
      : r.note
        ? r.note
        : r.missing.length || r.extra.length
          ? r.sharedWith.length
            ? `differs, but shares its page with ${r.sharedWith.join(', ')} - needs a person`
            : `${r.missing.length} to add, ${r.extra.length} to drop`
          : r.stale
            ? 'ALL PAST'
            : 'matches';
    console.log(pad(r.id, 26), pad(r.dates, 6), pad(r.last, 11), pad(r.published ? r.published.length : '-', 10), state);
  }

  for (const r of relevant.filter((x) => x.missing.length || x.extra.length)) {
    console.log(`\n${r.id}  (${r.schedule})`);
    if (r.sharedWith.length) {
      console.log(`  shares this page with ${r.sharedWith.join(', ')}: these are the page's dates, not this map's`);
    }
    if (r.missing.length) console.log(`  published, not in the definition: ${r.missing.join(', ')}`);
    if (r.extra.length) console.log(`  in the definition, not published:  ${r.extra.join(', ')}`);
  }

  const malformed = rows.filter((r) => r.malformed.length);
  if (malformed.length) {
    console.log('\nDates that are not YYYY-MM-DD, kept as written:');
    for (const r of malformed) console.log(`  ${r.id}: ${r.malformed.join(', ')}`);
  }

  const stale = rows.filter((r) => r.stale);
  console.log(`\n${checked.length} checked against a published schedule, ${stale.length} with every date in the past.`);
  if (stale.length && !includeAll) console.log('Run with --all to see every map, including those whose dates come from elsewhere.');
}

const bad = rows.filter((r) => r.stale || ((r.missing.length || r.extra.length) && r.sharedWith.length === 0));
process.exit(bad.length ? 1 : 0);
