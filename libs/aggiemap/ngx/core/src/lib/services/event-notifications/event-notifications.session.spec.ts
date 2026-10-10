import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { Notification, NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import {
  COLLEGE_STATION,
  EVENT_NOTIFICATION_DEFINITIONS,
  EventNotificationsService,
  NO_NOTIFICATIONS
} from './event-notifications.service';

/**
 * College Station's notices show on map pages only, and once per browser session (#1307).
 *
 * On production, notices raised on the main map stayed on screen after clicking through to All Maps
 * before they timed out: #1292 stopped them being raised there, but nothing took down the ones already
 * showing. And they came back on every reload, where a visitor should see each one once per session.
 */

const definition = (id: string) => ({
  configuration: {
    id,
    eventDates: [Date.now()],
    toast: { id: `${id}-toast`, title: id, message: id, acknowledge: true } as NotificationProperties
  }
});

/** Keeps what is on screen, as the real service does, so taking notices down can be observed. */
class FakeNotificationService {
  public readonly toasted: string[] = [];
  public readonly notifications = new BehaviorSubject<Notification[]>([]);

  public wasDismissedThisLoad(): boolean {
    return false;
  }

  public toast(properties: NotificationProperties): void {
    this.toasted.push(properties.id);
    this.notifications.next([
      ...this.notifications.value,
      { ...properties, timeGenerated: Date.now() } as unknown as Notification
    ]);
  }

  public remove(notification: Notification): void {
    this.notifications.next(this.notifications.value.filter((n) => n !== notification));
  }

  public showing(): string[] {
    return this.notifications.value.map((n) => n.id);
  }
}

describe('EventNotificationsService on map pages, once per session', () => {
  let notifications: FakeNotificationService;

  /** A fresh service, as a page load creates. Session storage carries over, as it does on a reload. */
  const load = () => {
    notifications = new FakeNotificationService();
    return TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          { provide: NotificationService, useValue: notifications },
          { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: [definition('ring-day'), definition('kickoff')] }
        ]
      })
      .runInInjectionContext(() => new EventNotificationsService());
  };

  afterEach(() => sessionStorage.clear());

  it('takes its notices down when the visitor leaves the map for a page that is not one', () => {
    const service = load();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    expect(notifications.showing()).toEqual(['ring-day-toast', 'kickoff-toast']);

    service.checkAndTriggerEventNotifications(NO_NOTIFICATIONS);

    expect(notifications.showing()).toEqual([]);
  });

  it('leaves other notifications alone when it takes its own down', () => {
    const service = load();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    notifications.toast({ id: 'url-copied', title: 'URL Copied', message: '' } as NotificationProperties);

    service.checkAndTriggerEventNotifications(NO_NOTIFICATIONS);

    expect(notifications.showing()).toEqual(['url-copied']);
  });

  it('does not raise them again on returning to a map in the same session', () => {
    const service = load();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications(NO_NOTIFICATIONS);
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
    expect(notifications.showing()).toEqual([]);
  });

  it('does not raise them again after a reload in the same session', () => {
    load().checkAndTriggerEventNotifications(COLLEGE_STATION);

    load().checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual([]);
  });

  it('raises them again in a new session', () => {
    // Both directions: a check that only proved they stay away would pass if notices had stopped
    // working altogether.
    load().checkAndTriggerEventNotifications(COLLEGE_STATION);
    sessionStorage.clear();

    load().checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
  });

  it('does not count a notice as seen until it has been shown', () => {
    // Visiting All Maps first must not use up the session's showing of a notice never put on screen.
    load().checkAndTriggerEventNotifications(NO_NOTIFICATIONS);

    load().checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
  });
});
