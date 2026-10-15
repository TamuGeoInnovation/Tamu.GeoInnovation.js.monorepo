import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { parseDateStrings } from './parse-date-strings';

/**
 * One day's events, for lists shown one table per day (#1775). `date` is null for the events that have
 * no day set yet.
 */
export interface EventDayGroup<T extends Partial<Event>> {
  key: string;
  date: Date | null;
  events: Array<T>;
}

/**
 * Groups events by their day, in day order, each day's events by start time. Events with no day come
 * last in a group of their own, and events whose start time cannot be read come last within their day.
 * The events given are not modified.
 */
export function groupEventsByDay<T extends Partial<Event>>(events: Array<T> | null | undefined): Array<EventDayGroup<T>> {
  const groups = new Map<string, EventDayGroup<T>>();

  for (const event of events ?? []) {
    const date = event?.day?.date ? new Date(event.day.date) : null;
    const key = date && !isNaN(date.getTime()) ? event.day.guid ?? date.toISOString() : 'no-day';

    if (!groups.has(key)) {
      groups.set(key, { key, date: key === 'no-day' ? null : date, events: [] });
    }

    groups.get(key).events.push(event);
  }

  // A start time that cannot be read sorts last, whether it parses to null or to an invalid Date.
  const startOf = (event: T) => {
    const time = parseDateStrings(event?.day?.date, event?.startTime)?.getTime();

    return time === undefined || isNaN(time) ? Number.POSITIVE_INFINITY : time;
  };

  return [...groups.values()]
    .map((group) => ({ ...group, events: [...group.events].sort((a, b) => startOf(a) - startOf(b)) }))
    .sort((a, b) => (a.date?.getTime() ?? Number.POSITIVE_INFINITY) - (b.date?.getTime() ?? Number.POSITIVE_INFINITY));
}
