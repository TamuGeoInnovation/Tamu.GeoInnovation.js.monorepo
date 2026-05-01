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

  public checkAndTriggerEventNotifications(): void {
    if (!this.definitions) {
      return;
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    this.definitions.forEach((eventDefinition) => {
      const config = eventDefinition.configuration;

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

      const isOngoing = eventDates.some((eventDate) => {
        const timeDiff = Math.abs(now - eventDate);
        return timeDiff < oneDay;
      });

      const isUpcoming = eventDates.some((eventDate) => {
        const timeDiff = eventDate - now;
        return timeDiff > 0 && timeDiff <= sevenDays;
      });

      if (isOngoing || isUpcoming) {
        this.triggerEventToast(config.toast, config.id);
      }
    });
  }

  private triggerEventToast(toastConfig: NotificationProperties, eventId: string): void {
    const notificationProps = { ...toastConfig };

    if (!notificationProps.id) {
      notificationProps.id = `event-${eventId}-toast`;
    }

    this.notificationService.toast(notificationProps);
  }
}
