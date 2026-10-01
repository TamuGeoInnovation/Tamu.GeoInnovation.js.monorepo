import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import {
  campusForRoute,
  COLLEGE_STATION,
  EventNotificationsService,
  NO_NOTIFICATIONS
} from './event-notifications.service';

/**
 * College Station's notifications stay on College Station's maps (#1265).
 *
 * Both directions on purpose. A test that only proves nothing appears on a campus map passes just as
 * happily when notifications have stopped working altogether, which is the regression this is most
 * likely to cause.
 */

const oneDay = 24 * 60 * 60 * 1000;

const definition = (id: string) => ({
  configuration: {
    id,
    eventDates: [Date.now()],
    toast: { id: `${id}-toast`, title: id, message: id, acknowledge: true } as NotificationProperties
  }
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

describe('campusForRoute', () => {
  it.each([
    ['/map/d', COLLEGE_STATION],
    ['/map/m', COLLEGE_STATION],
    ['/', COLLEGE_STATION],
    ['/events/150th-kickoff/map/d', COLLEGE_STATION],
    ['/parking/avp-parking/map', COLLEGE_STATION],
    ['/operations/ues-valves/map/d', COLLEGE_STATION],
    ['/all-maps', COLLEGE_STATION],
    ['/all-maps/campus', COLLEGE_STATION]
  ])('treats %s as College Station', (url, expected) => {
    expect(campusForRoute(url)).toBe(expected);
  });

  it.each([
    ['/campus/galveston', 'galveston'],
    ['/campus/mcallen/map/d', 'mcallen'],
    ['/campus/dc-bush-school/map/d?feature=x', 'dc-bush-school']
  ])('reads the campus out of %s', (url, expected) => {
    expect(campusForRoute(url)).toBe(expected);
  });

  it.each(['/kiosk/memorial-student-center', '/kiosk/x/map/d'])('shows nothing on the kiosk route %s', (url) => {
    expect(campusForRoute(url)).toBe(NO_NOTIFICATIONS);
  });

  it('is not confused by a path that merely contains the words', () => {
    // `/all-maps/campus` is the campus maps listing, not a campus map.
    expect(campusForRoute('/all-maps/campus')).toBe(COLLEGE_STATION);
    expect(campusForRoute('/events/campus-wide-thing/map')).toBe(COLLEGE_STATION);
  });

  it('survives an empty or odd url', () => {
    expect(campusForRoute('')).toBe(COLLEGE_STATION);
    expect(campusForRoute(undefined as unknown as string)).toBe(COLLEGE_STATION);
  });
});

describe('EventNotificationsService campus scoping', () => {
  let notifications: FakeNotificationService;

  const build = () => {
    notifications = new FakeNotificationService();
    return new EventNotificationsService(notifications as unknown as NotificationService, [
      definition('ring-day'),
      definition('kickoff')
    ]);
  };

  it('raises College Station notifications on a College Station map', () => {
    const service = build();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
  });

  it.each(['galveston', 'mcallen', 'dc-bush-school'])('raises nothing on the %s campus map', (campus) => {
    const service = build();

    service.checkAndTriggerEventNotifications(campus);

    expect(notifications.toasted).toEqual([]);
  });

  it('raises nothing on a kiosk surface', () => {
    const service = build();

    service.checkAndTriggerEventNotifications(NO_NOTIFICATIONS);

    expect(notifications.toasted).toEqual([]);
  });

  it('does not stack duplicates when the user moves between College Station maps', () => {
    // The shell calls this on every navigation now, not once per load.
    const service = build();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
  });

  it('still raises nothing after a visit to a campus map and back', () => {
    // Walking College Station -> campus -> College Station must not raise a second copy.
    const service = build();

    service.checkAndTriggerEventNotifications(COLLEGE_STATION);
    service.checkAndTriggerEventNotifications('galveston');
    service.checkAndTriggerEventNotifications(COLLEGE_STATION);

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
  });

  it('defaults to College Station when no campus is given', () => {
    // The parameter is optional so older callers keep working; the default must be the populated set,
    // not silence.
    const service = build();

    service.checkAndTriggerEventNotifications();

    expect(notifications.toasted).toEqual(['ring-day-toast', 'kickoff-toast']);
  });
});
