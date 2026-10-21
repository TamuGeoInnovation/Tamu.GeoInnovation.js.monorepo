/**
 * Reading each map's `eventDates` and `scheduleUrl` out of the definitions (#2019).
 *
 * The definitions are read as **text**, not imported. Importing them pulls the Angular dependency
 * graph into a plain Node process, which fails first on the JIT compiler and then on bundler-only
 * module resolution - `test/smoke/aggiemap/global-setup.ts` records the same constraint and reads them
 * the same way.
 *
 * That is a real limitation and worth knowing: a definition that computes its dates or its schedule
 * URL, rather than writing them out as literals, is invisible here. `tailgating` is exactly that - its
 * `scheduleUrl` is `FootballParkingConfiguration.scheduleUrl` - and it is reported as unreadable
 * rather than skipped silently.
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
export const DEFINITIONS_DIR = path.join(HERE, '..', '..', 'libs', 'ts', 'events', 'ngx', 'src', 'lib', 'definitions');

const EVENT_DATES = /eventDates:\s*\[([\s\S]*?)\]/;
const SCHEDULE_URL = /scheduleUrl:\s*(?:'([^']*)'|([A-Za-z][\w.]*))/;
const RETIRED = /\bstatus:\s*'retired'/;
const ISO_DATE = /'(\d{4})-(\d{1,2})-(\d{1,2})'/g;

/**
 * @typedef {object} MapDates
 * @property {string} id            the definition file's base name, e.g. `womens-basketball`
 * @property {string[]} dates       `eventDates`, as written
 * @property {string|null} schedule the literal `scheduleUrl`, or null when it is not a literal
 * @property {string|null} scheduleExpression  what was written instead, when not a literal
 * @property {boolean} retired
 */

/** Every definition that declares `eventDates` or a `scheduleUrl`. */
export function readDefinitions() {
  return fs
    .readdirSync(DEFINITIONS_DIR)
    .filter((file) => file.endsWith('.definitions.ts'))
    .map((file) => {
      const source = fs.readFileSync(path.join(DEFINITIONS_DIR, file), 'utf8');
      const dateBlock = source.match(EVENT_DATES);
      const schedule = source.match(SCHEDULE_URL);
      const dates = [];

      if (dateBlock) {
        for (const [, year, month, day] of dateBlock[1].matchAll(ISO_DATE)) {
          // Kept exactly as written, padding only for comparison: `womens-basketball` carries
          // '2026-01-1', a date missing a digit, and rewriting it here would hide that from the report.
          dates.push({ raw: `${year}-${month}-${day}`, iso: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` });
        }
      }

      return {
        id: file.replace('.definitions.ts', ''),
        dates,
        schedule: schedule && schedule[1] ? schedule[1] : null,
        scheduleExpression: schedule && !schedule[1] ? schedule[2] : null,
        retired: RETIRED.test(source)
      };
    })
    .filter((map) => map.dates.length > 0 || map.schedule || map.scheduleExpression);
}
