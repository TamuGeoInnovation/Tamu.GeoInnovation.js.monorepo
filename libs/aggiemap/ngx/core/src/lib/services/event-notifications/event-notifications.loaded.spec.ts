import { TestBed } from '@angular/core/testing';

import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import {
  COLLEGE_STATION,
  EVENT_NOTIFICATION_DEFINITIONS,
  EventNotificationsService,
  NO_NOTIFICATIONS
} from './event-notifications.service';

/**
 * The application gives the service a function that loads the event definitions, so they are not part
 * of the first download (#1454). Notices then arrive a moment after the page, which must not lose
 * them, raise them twice, or raise them on a map the visitor has since left.
 */

const definition = (id: string) => ({
  configuration: {
    id,
    eventDates: [Date.now()],
    toast: { id: `${id}-toast`, title: id, message: id, acknowledge: true } as NotificationProperties
  }
});

type Definitions = ReturnType<typeof definition>[];

describe('EventNotificationsService with definitions that load later', () => {
  let toasted: string[];
  let loads: number;
  let finish: (definitions: Definitions) => void;

  const build = () => {
    toasted = [];
    loads = 0;

    const source = () => {
      loads++;
      return new Promise<Definitions>((resolve) => (finish = resolve));
    };

    return TestBed.resetTestingModule()
      .configureTestingModule({
        providers: [
          {
            provide: NotificationService,
            useValue: {
              wasDismissedThisLoad: () => false,
              toast: (properties: NotificationProperties) => toasted.push(properties.id),
              notifications: { value: [] },
              remove: () => undefined
            }
          },
          { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: source }
        ]
      })
      .runInInjectionContext(() => new EventNotificationsService());
  };

  const settle = () => new Promise((resolve) => setTimeout(resolve));

  afterEach(() => sessionStorage.clear());

  it('raises nothing until the definitions have loaded, then raises them', async () => {
    const service = build();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    expect(toasted).toEqual([]);

    finish([definition('ring-day')]);
    await settle();

    expect(toasted).toEqual(['ring-day-toast']);
  });

  it('loads the definitions once, however many pages are visited while they load', async () => {
    const service = build();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);

    finish([definition('ring-day')]);
    await settle();

    expect(loads).toBe(1);
    expect(toasted).toEqual(['ring-day-toast']);
  });

  it('raises nothing if the visitor has left for a page without notices by the time they load', async () => {
    const service = build();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications(NO_NOTIFICATIONS);

    finish([definition('ring-day')]);
    await settle();

    expect(toasted).toEqual([]);
  });

  it('uses the loaded definitions at once on the next map', async () => {
    const service = build();

    service.checkAndTriggerEventNotifications(NO_NOTIFICATIONS);
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    finish([definition('kickoff')]);
    await settle();

    expect(loads).toBe(1);
    expect(toasted).toEqual(['kickoff-toast']);
  });
});
