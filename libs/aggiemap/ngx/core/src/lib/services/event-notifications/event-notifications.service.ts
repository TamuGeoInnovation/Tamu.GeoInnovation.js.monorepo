import { Injectable, InjectionToken, Optional, Inject } from '@angular/core';
import { NotificationService, NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

interface EventToastConfig {
  id: string;
  eventDates: Array<string | Date | number>;
  toast?: NotificationProperties;
}

interface EventNotificationEntry {
  configuration?: EventToastConfig | null;
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
   * Checks all event definitions for active events and triggers toast notifications
   * for any that have toast configuration and are currently active/upcoming.
   */
  public checkAndTriggerEventNotifications(): void {
    if (!this.definitions) {
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
        this.triggerEventToast(config.toast, config.id);
      }
    });
  }

  /**
   * Triggers a toast notification for an event.
   *
   * @param toastConfig The notification properties for the toast
   * @param eventId The event ID to ensure unique notification IDs
   */
  private triggerEventToast(toastConfig: NotificationProperties, eventId: string): void {
    // Create a copy of the toast config to avoid modifying the original
    const notificationProps = { ...toastConfig };

    // Add a unique ID if not provided to prevent duplicate notifications
    if (!notificationProps.id) {
      notificationProps.id = `event-${eventId}-toast`;
    }

    // Trigger the notification
    this.notificationService.toast(notificationProps);
  }
}
