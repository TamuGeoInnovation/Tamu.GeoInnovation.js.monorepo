import { Injectable, Optional, InjectionToken, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { PlatformNotification, NotificationProperties } from '../interfaces/notification.interface';
import { Notification } from '../helpers/notification.helper';

export const notificationStorage = new InjectionToken<string>('StorageKey');

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _store: Notification[];
  private _localStorageSettings: StorageConfig;
  private _events: PlatformNotification[] = [];

  public readonly notifications: Observable<Notification[]>;
  private _notifications: BehaviorSubject<Notification[]>;

  /**
   * The current generation of notification settings. This is used to determine if stored notifications
   * need to be migrated to a new format.
   */
  private _settingsGeneration = 3;
  private _defaultPrimaryStoreKey = 'app-notifications';
  private _defaultSecondaryStoreKey = 'notifications';

  constructor(
    private store: LocalStoreService,
    private environment: EnvironmentService,
    @Optional() @Inject(notificationStorage) private storageKey: string
  ) {
    this._localStorageSettings = {
      primaryKey: undefined
    };

    if (this.storageKey) {
      this._localStorageSettings.primaryKey = this.storageKey;
    } else {
      this._localStorageSettings.primaryKey = this._defaultPrimaryStoreKey;
    }

    this._notifications = new BehaviorSubject<Notification[]>([]);
    this.notifications = this._notifications.asObservable();

    if (this.environment.value('NotificationEvents')) {
      const eventProperties: NotificationProperties[] = this.environment.value('NotificationEvents');

      // As of this version, all applications are still defining events as NotificationProperties[]
      // To avoid breaking changes, we will keep this as is for now.
      // In the future, we may want to enforce a standard and convert older formats here.
      this._events = eventProperties.map((e: NotificationProperties) => {
        return {
          acknowledged: false,
          properties: e
        };
      });
    }

    const notificationsInLocalStorage: PlatformNotificationStore | undefined = this.store.getStorage({
      primaryKey: this._localStorageSettings.primaryKey
    });

    //
    // Migrate notification store if necessary
    //
    const migratedStored = this.migrate(notificationsInLocalStorage);

    // If there are notification in local storage, update the list in the client side
    this.store.setStorage<PlatformNotificationStore>({
      primaryKey: this._localStorageSettings.primaryKey,
      value: migratedStored
    });

    const stored = this.store.getStorage<PlatformNotificationStore>({
      primaryKey: this._localStorageSettings.primaryKey
    }) || { version: this._settingsGeneration, notifications: [] };

    // Store any active notifications. The service will take care of dispatching these to the notification module
    this._store = this.getActiveNotifications([...stored.notifications, ...this._events]).map((property) => {
      return new Notification(property);
    });

    // Populate the Subject with the store contents. Will trigger all subscribers to the public notifications observable
    this._notifications.next([...this._store]);
  }

  private migrate(storeData: PlatformNotificationStore | undefined): PlatformNotificationStore {
    const _default = { version: this._settingsGeneration, notifications: [] };

    if (!storeData) {
      return _default;
    }

    if (storeData['version'] === undefined || storeData['version'] < this._settingsGeneration) {
      // Data is in old format, just reset the local store.
      return _default;
    }

    return storeData;
  }

  /**
   * Gets active notification based on date range and acknowledgement status
   *
   * @param notifications LocalStorageObject with data that may be in old or new format
   */
  private getActiveNotifications(notifications: PlatformNotification[]): NotificationProperties[] {
    if (!notifications) {
      return [];
    }

    // For notifications with a range, return those for which the current date is active and not acknowledged.
    const rangeActive: NotificationProperties[] = notifications
      .filter((e: PlatformNotification) => {
        return (
          e.properties.range &&
          e.properties.range.length === 2 &&
          Date.now() >= e.properties.range[0] &&
          Date.now() <= e.properties.range[1]
        );
      })
      .filter((e: PlatformNotification) => {
        // If the notification requires acknowledgment and has been acknowledged, filter it out
        if (e.properties.acknowledge && e.acknowledged) {
          return false;
        }

        return true;
      })
      .filter((e: PlatformNotification) => {
        // At this point we have filtered out any notifications that are out of range or acknowledged
        // Since the original `notifications` array may contain duplicates (because it's a spread of app notifications + stored notifications), we need to check if this notification (which is assumed to be in range and unacknowledged) has duplicates that have been acknowledged
        //
        // If any duplicate has been acknowledged, we filter this one out
        // If no duplicates or none have been acknowledged, we keep it
        const matches = notifications.filter((n) => n.properties.id === e.properties.id);

        if (matches.length > 0) {
          // Only return the current notification if none of the matches have been acknowledged.
          // If at least one has been acknowledged, then we filter this one out.
          return matches.some((m) => m.acknowledged) === false;
        }

        // If no match found, include it in the active list.
        return true;
      })
      .map((e: PlatformNotification) => e.properties);

    return [...rangeActive];
  }

  /**
   * Pushes a one-time notification message, triggering any subscribed listeners.
   * Will not create the notification if it requires acknowledgment and has already been acknowledged.
   */
  public toast(properties: NotificationProperties): void {
    // If the notification requires acknowledgment and has an ID, check if it's already been acknowledged
    if (properties.acknowledge && properties.id) {
      if (this.isNotificationAcknowledged(properties.id)) {
        // Notification has been acknowledged, don't show it again
        return;
      }
    }

    const n: Notification = new Notification({ ...properties, timeGenerated: Date.now() });

    this._store = [...this._store, n];

    this._notifications.next([...this._store]);
  }

  /**
   * Checks if a notification with the given ID has been acknowledged.
   *
   * @param notificationId The ID of the notification to check
   * @returns True if the notification has been acknowledged, false otherwise
   */
  private isNotificationAcknowledged(notificationId: string): boolean {
    try {
      const currentLocalStorage: PlatformNotification[] | undefined = this.store.getStorageObjectKeyValue<PlatformNotification[]>({
        primaryKey: this._localStorageSettings.primaryKey,
        subKey: this._defaultSecondaryStoreKey
      });

      if (!currentLocalStorage) {
        return false;
      }

      // Check if any notification with this ID has been acknowledged
      const isAcknowledged = currentLocalStorage.some(
        (item: PlatformNotification) => item.properties.id === notificationId && item.acknowledged === true
      );

      return isAcknowledged;
    } catch (error) {
      console.warn('Error checking notification acknowledgment status:', error);
      return false;
    }
  }

  /**
   * Removes a notification object from the service store, and updates the notifications subject.
   * This method is called when a notification times out or is manually dismissed (but not acknowledged).
   */
  public remove(notification: Notification): void {
    // Create a new array without the provided notification object
    const filtered = this._store.filter((n) => {
      // Filter criteria will be one of two:
      //
      // 1. Return any object that is not have the ID of the provided notification object
      // 2. Return any object that HAS the ID of the provided notification object AND does not have
      //  the generation time stamp of the current notification object. This is because we may have
      //  duplicates of the same ID, but it is highly unlikely that they will ever be generated at
      //  the exact same millisecond.
      //
      return n.id !== notification.id || (n.id === notification.id && n.timeGenerated !== notification.timeGenerated);
    });

    // Set new store list
    this._store = [...filtered];

    // Set the notifications subject value
    this._notifications.next([...filtered]);

    // Note: We do NOT update the acknowledge property in local storage here
    // because this method is for dismissing/timing out, not acknowledging
  }

  /**
   * Acknowledges a notification, marking it so it won't be shown again.
   * This method is called when the user explicitly clicks "Don't show again".
   */
  public acknowledge(notification: Notification): void {
    // Remove from active notifications first
    this.remove(notification);

    // Create EmittedNotification to store in local storage
    const emittedNotification: PlatformNotification = {
      properties: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        acknowledge: notification.acknowledge,
        imgUrl: notification.imgUrl,
        imgAltText: notification.imgAltText,
        interval: notification.interval,
        range: notification.range,
        action: notification.action,
        timeGenerated: notification.timeGenerated
      },
      acknowledged: true
    };

    // Get current local storage data and migrate if necessary
    const currentLocalStorage = this.store.getStorage<PlatformNotificationStore>({
      primaryKey: this._localStorageSettings.primaryKey
    });

    let local: PlatformNotification[] = currentLocalStorage ? currentLocalStorage.notifications : [];

    // Check if the notification already exists in local storage
    const existingNotificationIndex = local.findIndex((n: PlatformNotification) => n.properties.id === notification.id);

    if (existingNotificationIndex >= 0) {
      // Update existing notification to mark it as acknowledged
      local = local.map((n: PlatformNotification) => {
        if (n.properties.id === notification.id) {
          return { ...n, acknowledged: true };
        }
        return n;
      });
    } else {
      // Add the notification to local storage with acknowledged = true
      local = [...local, emittedNotification];
    }

    // Update the local client notifications list
    this.store.setStorageObjectKeyValue({
      primaryKey: this._localStorageSettings.primaryKey,
      subKey: this._defaultSecondaryStoreKey,
      value: local
    });
  }

  /**
   * Attempts to find a notification event in the EVENTS notification list by the supplied id reference.
   * If found, it updates the service active notification store with it.
   *
   * If no match found, logs a warning in the console.
   */
  public preset(id: string): void {
    // Attempt to find notification event by ID from the latest EVENTS object
    const match: PlatformNotification | undefined = this._events.find((n) => n.properties.id === id);

    // If the referenced event by id was found, append it to the store and give the updated value to the subject
    if (match) {
      const obj = Object.assign({}, match);

      const notification = new Notification(obj.properties);

      this._store = [...this._store, notification];
      this._notifications.next([...this._store]);
    } else {
      console.warn('Could not emit notification because the referenced item does not exist');
    }
  }
}

interface PlatformNotificationStore {
  version: number;
  notifications: PlatformNotification[];
}
