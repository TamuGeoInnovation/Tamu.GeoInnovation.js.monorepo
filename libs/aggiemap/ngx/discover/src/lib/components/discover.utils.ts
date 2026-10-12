import { DiscoverApplication, InternalDiscoverApplication } from '../interfaces/discover-application.interface';
import { nextEventDate, parseEventDate } from '@tamu-gisc/common/utils/date';

/**
 * Builds the router commands used to navigate to a map application. Events live under `/events`,
 * satellite-campus maps live under `/campus`, everything else (parking, operations) is routed
 * under its own type segment.
 */
export function getApplicationRoute(app: InternalDiscoverApplication): string[] {
  const routeSegment = app.type === 'event' ? 'events' : app.type === 'satellite-campus' ? 'campus' : app.type;

  // Kiosk maps have no builder/options flow, so their working route always includes the trailing
  // `map` segment (e.g. `/kiosk/dining/map`) rather than `/kiosk/dining`.
  if (app.type === 'kiosk') {
    return [`/${routeSegment}`, app.id, 'map'];
  }

  return [`/${routeSegment}`, app.id];
}

/**
 * Splits a list of applications into evenly sized columns for the link layouts.
 */
export function buildApplicationColumns(apps: InternalDiscoverApplication[], columnCount = 2): InternalDiscoverApplication[][] {
  if (apps.length === 0) {
    return [];
  }

  const columns = Math.max(1, Math.min(columnCount, apps.length));
  const baseSize = Math.floor(apps.length / columns);
  const remainder = apps.length % columns;

  const result: InternalDiscoverApplication[][] = [];
  let start = 0;

  for (let index = 0; index < columns; index++) {
    const size = baseSize + (index < remainder ? 1 : 0);
    result.push(apps.slice(start, start + size));
    start += size;
  }

  return result;
}

export interface MapColumnDefinition {
  id: string;
  heading: string;
}

export interface MapColumnGroup {
  id: string;
  heading?: string;
  applications: InternalDiscoverApplication[];
}

/**
 * Builds named columns when a page opts into column headers. Maps without a matching key fall back
 * to the first configured column so they remain visible.
 */
export function buildNamedApplicationColumns(
  apps: InternalDiscoverApplication[],
  columnDefinitions: MapColumnDefinition[],
  getColumnKey: (app: InternalDiscoverApplication) => string | undefined = (app) => app.columnKey
): MapColumnGroup[] {
  if (!columnDefinitions || columnDefinitions.length === 0) {
    return buildApplicationColumns(apps, 3).map((applications, index) => ({
      id: `column-${index + 1}`,
      applications
    }));
  }

  const groups = columnDefinitions.map((definition) => ({
    id: definition.id,
    heading: definition.heading,
    applications: [] as InternalDiscoverApplication[]
  }));

  const groupLookup = new Map<string, MapColumnGroup>(
    groups.map((group) => [group.id.trim().toLowerCase(), group])
  );
  const fallbackGroup = groups[0];

  for (const app of apps) {
    const columnKey = getColumnKey(app)?.trim().toLowerCase();
    const group = columnKey ? groupLookup.get(columnKey) : undefined;

    if (group) {
      group.applications.push(app);
      continue;
    }

    if (columnDefinitions.length > 0) {
      console.warn(
        `Missing or unknown column key for '${app.id}'. Falling back to '${fallbackGroup.heading ?? fallbackGroup.id}'.`
      );
    }

    fallbackGroup.applications.push(app);
  }

  return groups;
}

/**
 * Builds column groups for a map page, using named columns when configured and a balanced fallback
 * when the page does not define column headers.
 */
export function buildMapColumnGroups(
  apps: InternalDiscoverApplication[],
  columnDefinitions?: MapColumnDefinition[],
  getColumnKey: (app: InternalDiscoverApplication) => string | undefined = (app) => app.columnKey
): MapColumnGroup[] {
  if (columnDefinitions && columnDefinitions.length > 0) {
    return buildNamedApplicationColumns(apps, columnDefinitions, getColumnKey);
  }

  return buildApplicationColumns(apps, 3).map((applications, index) => ({
    id: `column-${index + 1}`,
    applications
  }));
}

/**
 * Index the second ordered-list column should start at so numbering continues across columns.
 */
export function getSecondColumnStart(columns: InternalDiscoverApplication[][]): number {
  return columns[0].length + 1;
}

export function sortApplicationsByName<T extends DiscoverApplication>(apps: T[]): T[] {
  return [...apps].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parses an event date into epoch ms, reading `YYYY-MM-DD` in local time. Shared with the event maps'
 * passed-event check, so both read event dates the same way (#1298).
 */
export { parseEventDate };

/**
 * Returns a human-readable date range (or single date) for an event's configured dates.
 */
export function getEventDateRange(dates: Array<string | Date | number>): string {
  if (!dates || dates.length === 0) {
    return 'No dates available';
  }

  const parsedDates = dates.map((date) => parseEventDate(date)).sort((a, b) => a - b);
  const startDate = new Date(parsedDates[0]);
  const endDate = new Date(parsedDates[parsedDates.length - 1]);

  if (parsedDates.length === 1) {
    return startDate.toLocaleDateString();
  }

  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

/**
 * The one date an upcoming event next happens on, formatted as `getEventDateRange` formats a single
 * date.
 *
 * Upcoming Events answers "when is the next one", and a repeat event's whole range is the wrong
 * answer to it: Ring Day runs 8-10 October, so on 6 October the range read "10/8/2026 - 10/10/2026",
 * three numbers to read where one will do, ending on the date nobody is going to (#1443).
 *
 * `nextEventDate` decides which date that is, so this agrees by construction with the ordering of the
 * list itself, which is built from the same call. An event is on for its whole day, so today counts
 * (#1301).
 *
 * Falls back to the full range when no date is still to come. The Upcoming Events list cannot show
 * such an event - it is filtered out before it gets here - but a caller elsewhere can, and a range is
 * a better answer than an empty one.
 */
export function getNextEventDate(dates: Array<string | Date | number>, now: number = Date.now()): string {
  const next = nextEventDate(dates, now);

  return next === null ? getEventDateRange(dates) : new Date(next).toLocaleDateString();
}

/**
 * Filters out events whose dates are entirely in the past. Events without dates are kept.
 */
export function filterUpcomingEvents(apps: InternalDiscoverApplication[]): InternalDiscoverApplication[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  return apps.filter((app) => {
    const dates = app.configuration.eventDates;
    if (!dates || dates.length === 0) return true;
    return dates.some((date) => parseEventDate(date) >= todayMs);
  });
}
