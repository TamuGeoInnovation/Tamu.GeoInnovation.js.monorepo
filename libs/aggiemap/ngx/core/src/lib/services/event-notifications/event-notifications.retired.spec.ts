import { TestBed } from '@angular/core/testing';

import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EVENT_NOTIFICATION_DEFINITIONS, EventNotificationsService } from './event-notifications.service';

/**
 * A retired event raises no notice, whatever its dates say (#1995).
 *
 * Retiring normally happens once an event is over, so the seven-day window would have hidden it
 * anyway and nothing noticed that `status` was never read here. An event **cancelled before it
 * happens** keeps a future date: Live at the Station was cancelled on 20 October 2026 and its map
 * was retired, but its date stayed 7 November, so from 31 October its notice would have appeared on
 * every page load, inviting people to a concert that is not taking place.
 *
 * That is the case these cover - the ordinary one, where retiring and the date agree, is the one
 * that already worked.
 */

afterEach(() => sessionStorage.clear());

const oneDay = 24 * 60 * 60 * 1000;

const definition = (id: string, dayOffset: number, status?: string) => ({
  configuration: {
    id,
    eventDates: [Date.now() + dayOffset * oneDay],
    toast: {
      id: `${id}-toast`,
      title: id,
      message: id,
      acknowledge: true
    } as NotificationProperties
  },
  ...(status ? { discover: { status } } : {})
});

class FakeNotificationService {
  public readonly toasted: string[] = [];

  public dismiss(): void {
    // Nothing is dismissed in these tests; the service only asks whether something was.
  }

  public wasDismissedThisLoad(): boolean {
    return false;
  }

  public toast(properties: NotificationProperties): void {
    this.toasted.push(properties.id);
  }
}

describe('EventNotificationsService, retired events', () => {
  let notifications: FakeNotificationService;

  const build = (definitions: Array<ReturnType<typeof definition>>) => {
    notifications = new FakeNotificationService();

    return TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          { provide: NotificationService, useValue: notifications },
          { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: definitions }
        ]
      })
      .runInInjectionContext(() => new EventNotificationsService());
  };

  it('raises nothing for a retired event whose date is still to come', () => {
    // The Live at the Station case: cancelled, retired, and still dated in three days.
    const service = build([definition('live-at-the-station', 3, 'retired')]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual([]);
  });

  it('raises nothing for a retired event happening today', () => {
    const service = build([definition('cancelled-today', 0, 'retired')]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual([]);
  });

  it('still raises the other events when one of them is retired', () => {
    // Retiring one must not quietly suppress the rest, which a `return` in the wrong place would do.
    const service = build([definition('cancelled', 2, 'retired'), definition('kickoff', 2)]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual(['kickoff-toast']);
  });

  it('leaves an event with no Discover entry alone', () => {
    // Not every definition carries one, and a missing entry is not a retired one.
    const service = build([definition('ring-day', 1)]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual(['ring-day-toast']);
  });
});
