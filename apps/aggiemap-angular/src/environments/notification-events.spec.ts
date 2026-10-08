import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';

import { NotificationEvents } from './notification-events';

const ONE_DAY = 24 * 60 * 60 * 1000;

const toTime = (date: string | number | Date) =>
  typeof date === 'string' ? new Date(date).getTime() : typeof date === 'number' ? date : date.getTime();

/**
 * Each event raises at most one notification (#1570).
 *
 * An event with a definition announces itself through the definition's `toast`, which
 * EventNotificationsService shows from seven days before the event until a day after it. A notice
 * hard-coded here for the same days is a second one: October 2026's Ring Day showed both, as "1 of 2".
 */
describe('NotificationEvents', () => {
  const toastWindows = EventDefinitions.map((d) => d.configuration)
    .filter((c) => c?.toast && c.eventDates?.length)
    .map((c) => {
      const dates = c.eventDates.map(toTime);
      return { id: c.id, from: Math.min(...dates) - 7 * ONE_DAY, to: Math.max(...dates) + ONE_DAY };
    });

  it('finds the event toasts to compare against', () => {
    expect(toastWindows.length).toBeGreaterThan(0);
  });

  it.each(NotificationEvents.filter((n) => n.range?.length === 2).map((n) => [n.id, n.range]))(
    'does not show %s while an event toast is showing',
    (_id, range) => {
      const [start, end] = range as number[];
      const overlapping = toastWindows.filter((w) => start <= w.to && end >= w.from).map((w) => w.id);

      expect(overlapping).toEqual([]);
    }
  );
});
