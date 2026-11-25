import { map, OperatorFunction } from 'rxjs';

import { SUBMISSION_DEADLINE_FIELDS } from '@tamu-gisc/gisday/common';

/**
 * The fields of a season, its days and competitions, and its sessions that the entities declare as `Date` and the API
 * sends as ISO text, because JSON has no dates (#3558): every record's `created` and `updated`, a day's `date`, a
 * season's competition deadlines, and a competition's `finalistsNotifiedAt`.
 */
export const WIRE_DATE_FIELDS: ReadonlySet<string> = new Set([
  'created',
  'updated',
  'date',
  'finalistsNotifiedAt',
  ...SUBMISSION_DEADLINE_FIELDS
]);

/** An instant as the API writes one: `2026-11-16T06:00:00.000Z`. A time of day such as `14:00:00` is not one. */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * A response as its type describes it (#3558): each of {@link WIRE_DATE_FIELDS} that holds ISO text, at any depth, as
 * a `Date`. Anything else, including a null or missing date and text that is not an instant, is left as it came. The
 * response itself is not changed; the answer is a copy.
 */
export function fromWire<T>(body: T): T {
  return revive(body, null) as T;
}

function revive(value: unknown, key: string | null): unknown {
  if (typeof value === 'string') {
    return key !== null && WIRE_DATE_FIELDS.has(key) && ISO_INSTANT.test(value) ? new Date(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => revive(item, null));
  }

  if (value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, revive(v, k)]));
  }

  return value;
}

/** {@link fromWire} on each response, where it arrives, so every page reads the dates the types promise. */
export function withWireDates<T>(): OperatorFunction<T, T> {
  return map((body) => fromWire(body));
}
