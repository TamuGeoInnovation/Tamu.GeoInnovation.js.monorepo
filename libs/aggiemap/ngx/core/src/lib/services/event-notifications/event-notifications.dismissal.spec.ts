import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EventNotificationsService } from './event-notifications.service';

/**
 * Event toasts and dismissal across routes (#1246).
 *
 * The event maps are lazy routes of AggieMap, and the application shell raises the event toasts once
 * per page load. Two things follow, and both are what this covers:
 *
 * - someone who opens an event map by link has never seen the toasts, so they are raised;
 * - someone who cleared them a moment ago on another route must not have them raised again.
 *
 * The service is constructed directly. A `TestBed` would add nothing: the whole subject is which
 * definitions reach `NotificationService.toast`.
 */

// A notice shown once is not shown again this session (#1307), so each test starts a new session.
afterEach(() => sessionStorage.clear());

const oneDay = 24 * 60 * 60 * 1000;

const definition = (id: string, dayOffset: number, toast?: Partial<NotificationProperties>) => ({
  configuration: {
    id,
    eventDates: [Date.now() + dayOffset * oneDay],
    toast: {
      id: `${id}-toast`,
      title: id,
      message: id,
      acknowledge: true,
      ...toast
    } as NotificationProperties
  }
});

class FakeNotificationService {
  public readonly toasted: string[] = [];
  private readonly _dismissed = new Set<string>();

  public dismiss(id: string): void {
    this._dismissed.add(id);
  }

  public wasDismissedThisLoad(id: string): boolean {
    return this._dismissed.has(id);
  }

  public toast(properties: NotificationProperties): void {
    this.toasted.push(properties.id);
  }
}

describe('EventNotificationsService', () => {
  let notifications: FakeNotificationService;

  const build = (definitions: Array<ReturnType<typeof definition>>) => {
    notifications = new FakeNotificationService();

    return new EventNotificationsService(notifications as unknown as NotificationService, definitions);
  };

  it('raises a toast for an event happening today', () => {
    const service = build([definition('ring-day', 0)]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual(['ring-day-toast']);
  });

  it('raises a toast for an event within the next seven days', () => {
    const service = build([definition('kickoff', 3)]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual(['kickoff-toast']);
  });

  it('leaves an event further out than seven days alone', () => {
    const service = build([definition('later', 30)]);

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual([]);
  });

  it('does not raise a toast the user already dismissed during this page load', () => {
    // The shell raises these on every route. Without the check, walking from the main map to an event
    // map put the whole stack back a moment after the user cleared it - the fault in #1246.
    const service = build([definition('ring-day', 0), definition('kickoff', 1)]);
    notifications.dismiss('ring-day-toast');
    notifications.dismiss('kickoff-toast');

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual([]);
  });

  it('still raises the toasts the user has not dismissed', () => {
    // Someone who opens an event map by link, having never been to the main map, should be told about
    // the events that are on.
    const service = build([definition('ring-day', 0), definition('kickoff', 1)]);
    notifications.dismiss('ring-day-toast');

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual(['kickoff-toast']);
  });

  it('matches the dismissal against the generated id when the toast declares none', () => {
    // `triggerEventToast` falls back to `event-<id>-toast`. The dismissal has to be checked against
    // the id actually used, not the one the definition did not supply.
    const service = build([definition('ring-day', 0, { id: undefined })]);
    notifications.dismiss('event-ring-day-toast');

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual([]);
  });

  it('does nothing when no definitions are provided', () => {
    const service = new EventNotificationsService(
      (notifications = new FakeNotificationService()) as unknown as NotificationService,
      null
    );

    expect(() => service.checkAndTriggerEventNotifications()).not.toThrow();
    expect(notifications.toasted).toEqual([]);
  });
});
