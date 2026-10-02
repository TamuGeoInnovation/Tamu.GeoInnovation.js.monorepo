import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NotificationService, NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

interface EventToastConfig {
  id: string;
  eventDates: Array<string | Date | number>;
  toast?: NotificationProperties;
  /** The series this event belongs to, if any. Supplies a shared toast icon - see EVENT_SERIES_ICONS. */
  series?: string;
}

/**
 * The icon a series' events use in notifications.
 *
 * Events in a series share an identity, and repeating a file path in every definition means the next
 * one is added without it, or a logo change misses one. A definition says which series it belongs to;
 * the icon follows from that.
 *
 * A toast may still set `imgUrl` itself, which wins - for a one-off that genuinely differs.
 */
export const EVENT_SERIES_ICONS: Record<string, { imgUrl: string; imgAltText: string }> = {
  '150th': {
    imgUrl: './assets/images/logo/150th-wordmark-stacked-maroon.svg',
    imgAltText: 'Texas A&M 150th Anniversary'
  }
};

interface EventNotificationEntry {
  configuration?: EventToastConfig | null;
}

/**
 * The campus a map belongs to, and therefore whose notifications it shows.
 *
 * AggieMap is the College Station application: Ring Day, Football, Kickoff at Kyle and the 150th
 * events are all College Station, and showing them on a satellite campus map is wrong - those
 * campuses are separate places, and each will have notifications of its own that must stay separate
 * from College Station's and from each other's. See #1265.
 *
 * Expressed as "which campus is this", rather than as a list of maps to suppress, so a campus added
 * later shows its own notifications and no one else's by default, instead of inheriting College
 * Station's until somebody remembers to add it to a deny list.
 */
export type CampusId = string;

export const COLLEGE_STATION: CampusId = 'college-station';

/** A surface that shows no notifications at all, whoever's they are. */
export const NO_NOTIFICATIONS: CampusId = 'none';

/**
 * Whose notifications a route shows.
 *
 * - `/campus/:id` is a satellite campus, and shows that campus's own.
 * - `/kiosk/:id` shows none. Kiosk maps are sidebar-free, preset-layer maps embedded elsewhere, such
 *   as in a mobile app webview. There is nobody at the screen to dismiss a toast, and it would draw
 *   over the map inside someone else's application.
 * - `/code-maroon` shows none. It carries an emergency alert, and an event toast about cake and ice
 *   cream stacking under a tornado warning is the kind of thing that destroys trust in the alert
 *   itself. Nothing competes with Code Maroon on that route (#1289).
 * - College Station's maps - the main map (`/map`), and an event, parking or operations map
 *   (`/events/:id/map`, and so on) - show College Station's.
 * - Everything else shows none: the All Maps pages, the builders, about and the like. Notices belong
 *   on a page showing a map, not over a list of maps or a form (#1290).
 */
export function campusForRoute(url: string): CampusId {
  const path = (url || '').split('?')[0].split('#')[0];

  if (/(?:^|\/)kiosk\//.test(path) || /(?:^|\/)code-maroon(?:\/|$)/.test(path)) {
    return NO_NOTIFICATIONS;
  }

  const match = path.match(/(?:^|\/)campus\/([^/]+)/);

  if (match) {
    return match[1];
  }

  return COLLEGE_STATION_MAP.test(path) ? COLLEGE_STATION : NO_NOTIFICATIONS;
}

/** A College Station map page: `/map`, or an event, parking or operations map. */
const COLLEGE_STATION_MAP = /^\/(?:(?:events|parking|operations)\/[^/]+\/)?map(?:\/|$)/;

/**
 * The campus each map shown belongs to, as the router navigates. The application shell raises
 * notifications from this.
 *
 * Driven by `NavigationEnd` alone, which the router also emits for the first page. Not seeded with
 * `router.url`: the shell subscribes before the first navigation finishes, when that is still `/`,
 * which reads as College Station - so a campus map opened directly got College Station's notifications
 * for its first moment, and they stayed (#1265).
 */
export function campusOnNavigation(router: Pick<Router, 'events' | 'url'>): Observable<CampusId> {
  return router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => campusForRoute(router.url))
  );
}

export const EVENT_NOTIFICATION_DEFINITIONS = new InjectionToken<EventNotificationEntry[]>('EVENT_NOTIFICATION_DEFINITIONS');

@Injectable({
  providedIn: 'root'
})
export class EventNotificationsService {
  constructor(
    private readonly notificationService: NotificationService,
    @Optional() @Inject(EVENT_NOTIFICATION_DEFINITIONS) private readonly definitions: EventNotificationEntry[] | null
  ) {}

  /**
   * Ids raised during this page load, so navigating does not stack a second copy of each.
   *
   * The shell calls this on every navigation rather than once, because whether notifications belong
   * here depends on which map is showing. Without this, walking between two College Station maps
   * would raise the same notifications again each time.
   */
  private readonly _raised = new Set<string>();

  /**
   * Checks all event definitions for active events and triggers toast notifications
   * for any that have toast configuration and are currently active/upcoming.
   *
   * Called from the application shell on each navigation, so that an event map reached by link
   * raises them as well - the event maps are lazy routes of this same application. Anything the user
   * has already dismissed during this load is left alone; see `NotificationService`.
   *
   * `campus` is the campus whose map is showing. These definitions are College Station's, so nothing
   * is raised on a satellite campus map. When those campuses get notifications of their own, this is
   * where they are matched rather than a new mechanism. See #1265.
   */
  public checkAndTriggerEventNotifications(campus: CampusId = COLLEGE_STATION): void {
    if (!this.definitions || campus !== COLLEGE_STATION) {
      return;
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const sevenDays = 7 * oneDay;

    this.definitions.forEach((eventDefinition) => {
      const config = eventDefinition.configuration;

      // Skip if no configuration or no toast config
      if (!config || !config.toast || !config.eventDates) {
        return;
      }

      const eventDates = config.eventDates.map((date) => {
        if (typeof date === 'string') {
          return new Date(date).getTime();
        } else if (typeof date === 'number') {
          return date;
        } else {
          return date.getTime();
        }
      });

      // Check if any event date is within the next 7 days (upcoming) or is today (ongoing)
      const isOngoing = eventDates.some((eventDate) => {
        const timeDiff = Math.abs(now - eventDate);
        return timeDiff < oneDay; // Event is today (within 24 hours)
      });

      const isUpcoming = eventDates.some((eventDate) => {
        const timeDiff = eventDate - now;
        return timeDiff > 0 && timeDiff <= sevenDays; // Event is within next 7 days
      });

      if (isOngoing || isUpcoming) {
        this.triggerEventToast(config.toast, config.id, config.series);
      }
    });
  }

  /**
   * Triggers a toast notification for an event.
   *
   * @param toastConfig The notification properties for the toast
   * @param eventId The event ID to ensure unique notification IDs
   */
  private triggerEventToast(toastConfig: NotificationProperties, eventId: string, series?: string): void {
    // Create a copy of the toast config to avoid modifying the original
    const notificationProps = { ...toastConfig };

    // A series supplies the icon unless the toast set one itself.
    if (!notificationProps.imgUrl && series && EVENT_SERIES_ICONS[series]) {
      notificationProps.imgUrl = EVENT_SERIES_ICONS[series].imgUrl;
      notificationProps.imgAltText = notificationProps.imgAltText || EVENT_SERIES_ICONS[series].imgAltText;
    }

    // Add a unique ID if not provided to prevent duplicate notifications
    if (!notificationProps.id) {
      notificationProps.id = `event-${eventId}-toast`;
    }

    // Already dismissed during this page load, so leave it dismissed. This runs on every navigation,
    // and without the check, walking from the main map to an event map would raise the whole stack
    // again a moment after the user cleared it.
    if (this.notificationService.wasDismissedThisLoad(notificationProps.id)) {
      return;
    }

    // Already showing from an earlier navigation in this load.
    if (this._raised.has(notificationProps.id)) {
      return;
    }

    this._raised.add(notificationProps.id);

    // Trigger the notification
    this.notificationService.toast(notificationProps);
  }
}
