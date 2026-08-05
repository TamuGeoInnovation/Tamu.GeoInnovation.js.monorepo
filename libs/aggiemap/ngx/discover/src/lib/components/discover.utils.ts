import { DiscoverApplication, InternalDiscoverApplication } from '../interfaces/discover-application.interface';

/**
 * Builds the router commands used to navigate to a map application. Events live under `/events`,
 * everything else (parking, operations) is routed under its own type segment.
 */
export function getApplicationRoute(app: InternalDiscoverApplication): string[] {
  const routeSegment = app.type === 'event' ? 'events' : app.type;
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
 * Parses the various supported event date representations (epoch, Date, or string) into epoch ms.
 * Date-only strings (`YYYY-MM-DD`) are parsed in local time to avoid timezone drift.
 */
export function parseEventDate(date: string | Date | number): number {
  if (typeof date === 'number') {
    return date;
  }

  if (date instanceof Date) {
    return date.getTime();
  }

  const dateOnlyMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  return new Date(date).getTime();
}

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
