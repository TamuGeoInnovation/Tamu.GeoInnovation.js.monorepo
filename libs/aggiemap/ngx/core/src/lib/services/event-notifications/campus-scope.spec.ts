import { NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { NotificationProperties, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import {
  campusForRoute,
  campusOnNavigation,
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
    ['/map', COLLEGE_STATION],
    ['/map/d', COLLEGE_STATION],
    ['/map/m', COLLEGE_STATION],
    ['/map/d/settings?basemap=x', COLLEGE_STATION],
    ['/events/150th-kickoff/map/d', COLLEGE_STATION],
    ['/parking/avp-parking/map', COLLEGE_STATION],
    ['/operations/ues-valves/map/d', COLLEGE_STATION]
  ])('treats the College Station map %s as College Station', (url, expected) => {
    expect(campusForRoute(url)).toBe(expected);
  });

  // Notices belong on a page showing a map, not over a list of maps or a form (#1290).
  it.each([
    '/',
    '/all-maps',
    '/all-maps/campus',
    '/all-maps/parking',
    '/all-maps/campus-events',
    '/about',
    '/directory',
    '/events/ring-day/builder/accommodations/event-day',
    '/events/150th-kickoff'
  ])('shows nothing on %s, which is not a map page', (url) => {
    expect(campusForRoute(url)).toBe(NO_NOTIFICATIONS);
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
    // `/all-maps/campus` is the campus maps listing, not a campus map - and, as a listing rather than a
    // map, it shows no notices at all (#1290).
    expect(campusForRoute('/all-maps/campus')).toBe(NO_NOTIFICATIONS);
    expect(campusForRoute('/events/campus-wide-thing/map')).toBe(COLLEGE_STATION);
  });

  it('survives an empty or odd url', () => {
    // No address means no map page to put notices on (#1290). The router never reports one in practice.
    expect(campusForRoute('')).toBe(NO_NOTIFICATIONS);
    expect(campusForRoute(undefined as unknown as string)).toBe(NO_NOTIFICATIONS);
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

/**
 * A campus map opened directly must never see College Station's notifications, even briefly (#1265).
 *
 * The shell starts before the router has finished its first navigation, while the router's url is still
 * `/`. #1266 read that url as the starting point, so a campus map opened by link - or by the smoke
 * suite - was treated as College Station for its first moment and got all of College Station's
 * notifications, which then stayed. On dev, the DC map's popup test clicked the Football notification
 * instead of the building and landed on the Football builder.
 */
describe('campusOnNavigation', () => {
  /** A router mid-way through its first navigation: no NavigationEnd yet, and `url` still `/`. */
  const routerBeforeFirstNavigation = () => {
    const events = new Subject<unknown>();
    const router = { events, url: '/' };

    return {
      router,
      navigateTo(url: string) {
        router.url = url;
        events.next(new NavigationEnd(1, url, url));
      }
    };
  };

  it('reports only the campus actually loaded, when a campus map is the first page', () => {
    const { router, navigateTo } = routerBeforeFirstNavigation();
    const seen: string[] = [];

    campusOnNavigation(router as never).subscribe((campus) => seen.push(campus));
    navigateTo('/campus/dc-bush-school/map/d');

    expect(seen).toEqual(['dc-bush-school']);
  });

  it('reports College Station when the main map is the first page', () => {
    const { router, navigateTo } = routerBeforeFirstNavigation();
    const seen: string[] = [];

    campusOnNavigation(router as never).subscribe((campus) => seen.push(campus));
    navigateTo('/map/d');

    expect(seen).toEqual([COLLEGE_STATION]);
  });

  it('follows later navigations', () => {
    const { router, navigateTo } = routerBeforeFirstNavigation();
    const seen: string[] = [];

    campusOnNavigation(router as never).subscribe((campus) => seen.push(campus));
    navigateTo('/campus/galveston');
    navigateTo('/map/d');
    navigateTo('/kiosk/memorial-student-center');

    expect(seen).toEqual(['galveston', COLLEGE_STATION, NO_NOTIFICATIONS]);
  });
});
