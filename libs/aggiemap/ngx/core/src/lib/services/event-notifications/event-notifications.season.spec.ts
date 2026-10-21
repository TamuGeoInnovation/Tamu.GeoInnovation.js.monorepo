import { TestBed } from '@angular/core/testing';

import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EVENT_NOTIFICATION_DEFINITIONS, EventNotificationsService } from './event-notifications.service';

/**
 * A notice acknowledged last season is shown again for the new one (#2051).
 *
 * "Don't show again" is remembered in local storage by the notice's id. Baseball's id was
 * `baseball-parking-notification-2026`, a season typed into it by hand so the notice would come back
 * each spring - which only works if somebody remembers to edit it every year. Nobody had for 2027, so
 * a visitor who acknowledged it in 2026 would never have seen it for the 2027 season. The ids with no
 * season at all (Football, Ring Day, Tailgating) were acknowledged for good.
 *
 * The season is now the year of the definition's earliest date, added by the service, so giving a map
 * its new season's dates is all it takes.
 */

afterEach(() => {
  sessionStorage.clear();
  vi.useRealTimers();
});

const definition = (id: string, eventDates: string[]) => ({
  configuration: {
    id,
    eventDates,
    toast: { id: `${id}-notification`, title: id, message: id, acknowledge: true } as NotificationProperties
  }
});

/** Refuses an acknowledged id, as `NotificationService.toast` does. */
class FakeNotificationService {
  public readonly toasted: string[] = [];
  public readonly acknowledged = new Set<string>();

  public wasDismissedThisLoad(): boolean {
    return false;
  }

  public toast(properties: NotificationProperties): void {
    if (!this.acknowledged.has(properties.id)) {
      this.toasted.push(properties.id);
    }
  }
}

describe('EventNotificationsService, seasons', () => {
  const notifications = new FakeNotificationService();

  /** A page load on `day`, with `definitions` as they stood then. */
  const visit = (day: string, definitions: Array<ReturnType<typeof definition>>) => {
    vi.useFakeTimers({ now: new Date(`${day}T17:00:00Z`), toFake: ['Date'] });
    sessionStorage.clear();
    notifications.toasted.length = 0;

    TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          { provide: NotificationService, useValue: notifications },
          { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: definitions }
        ]
      })
      .runInInjectionContext(() => new EventNotificationsService())
      .checkAndTriggerEventNotifications();

    return [...notifications.toasted];
  };

  it('shows a notice acknowledged last season once the map has the new season dates', () => {
    const shown2026 = visit('2026-02-19', [definition('baseball', ['2026-02-20', '2026-05-23'])]);

    expect(shown2026).toHaveLength(1);
    notifications.acknowledged.add(shown2026[0]);

    expect(visit('2027-02-18', [definition('baseball', ['2027-02-19', '2027-05-22'])])).toHaveLength(1);
  });

  it('keeps one id across a season that runs into the next year', () => {
    // Basketball runs November to March: acknowledging it in November holds for the whole season.
    const season = [definition('basketball', ['2026-11-03', '2027-03-06'])];

    expect(visit('2026-11-02', season)).toEqual(visit('2027-03-05', season));
  });
});
