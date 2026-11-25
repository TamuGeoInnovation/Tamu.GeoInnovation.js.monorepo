import { TestBed } from '@angular/core/testing';

import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { EVENT_NOTIFICATION_DEFINITIONS, EventNotificationsService } from './event-notifications.service';

/**
 * An event's notice is still raised on the evening of its event (#3467).
 *
 * The definitions give date-only strings. Read with `new Date`, `'2026-10-02'` is UTC midnight - 7 PM Central on 1
 * October - so the service's "within a day" window closed at 7 PM Central on the event's own day, and an evening event
 * raised no notice. The shared `parseEventDate` and `nextEventDate` read the date as local midnight.
 *
 * The zone is set here, not in the environment: Git Bash's `TZ=America/Chicago` silently means UTC (CLAUDE.md), and a
 * test run in UTC could not see the fault at all.
 */
const ZONE = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'America/Chicago';
});

afterAll(() => {
  process.env.TZ = ZONE;
});

afterEach(() => {
  sessionStorage.clear();
  vi.useRealTimers();
});

class FakeNotificationService {
  public readonly toasted: string[] = [];

  public wasDismissedThisLoad(): boolean {
    return false;
  }

  public toast(properties: NotificationProperties): void {
    this.toasted.push(properties.id);
  }
}

/** The notices raised by a page load at `instant` (UTC), for a made-up event on 2 October 2026. */
function raisedAt(instant: string): string[] {
  vi.useFakeTimers({ now: new Date(instant), toFake: ['Date'] });

  const notifications = new FakeNotificationService();
  const definitions = [
    {
      configuration: {
        id: 'evening-concert',
        eventDates: ['2026-10-02'],
        toast: { id: 'evening-concert-notification', title: 'Concert', message: 'Concert', acknowledge: true } as NotificationProperties
      }
    }
  ];

  TestBed.resetTestingModule()
    .configureTestingModule({
      providers: [
        { provide: NotificationService, useValue: notifications },
        { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: definitions }
      ]
    })
    .runInInjectionContext(() => new EventNotificationsService())
    .checkAndTriggerEventNotifications();

  return notifications.toasted;
}

describe('EventNotificationsService, an event on its own evening (#3467)', () => {
  it('runs in Central time, or it proves nothing', () => {
    // 1:00 AM UTC on 3 October is 8 PM on 2 October in College Station.
    expect(new Date('2026-10-03T01:00:00Z').getDate()).toBe(2);
  });

  it('raises the notice at 8 PM Central on the day of the event', () => {
    expect(raisedAt('2026-10-03T01:00:00Z')).toHaveLength(1);
  });

  it('raises no notice at 8 PM Central the day after', () => {
    expect(raisedAt('2026-10-04T01:00:00Z')).toHaveLength(0);
  });
});
