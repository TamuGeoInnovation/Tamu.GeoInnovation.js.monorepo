import { Injectable, Optional, InjectionToken, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EmittedNotification, NotificationProperties } from '../interfaces/notification.interface';
import { Notification } from '../helpers/notification.helper';

export const notificationStorage = new InjectionToken<string>('StorageKey');

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _store: Notification[];
  private _localStorageSettings: StorageConfig;
  private _events: NotificationProperties[];

  public readonly notifications: Observable<Notification[]>;
  private _notifications: BehaviorSubject<Notification[]>;

  constructor(
    private store: LocalStoreService,
    private environment: EnvironmentService,
    @Optional() @Inject(notificationStorage) private storageKey: string
  ) {
    this._localStorageSettings = {
      primaryKey: undefined,
      subKey: 'data'
    };

    if (this.storageKey) {
      this._localStorageSettings.primaryKey = this.storageKey;
    } else {
      this._localStorageSettings.primaryKey = 'app-notifications';
    }

    this._notifications = new BehaviorSubject([]);
    this.notifications = this._notifications.asObservable();

    if (this.environment.value('NotificationEvents')) {
      this._events = this.environment.value('NotificationEvents');
    }

    const notificationsInLocalStorage: LocalStorageObject = this.store.getStorage({
      primaryKey: this._localStorageSettings.primaryKey
    });

    // If no notifications in local storage, store the full list in the client local storage.
    // This is kept to keep track of what notifications to show at any given time.
    if (!notificationsInLocalStorage || !notificationsInLocalStorage.data) {
      const initialEmittedNotifications: EmittedNotification[] =
        this._events?.map((event) => ({
          notification: {
            ...event,
            timeGenerated: event.timeGenerated || Date.now()
          },
          acknowledged: false
        })) || [];

      this.store.setStorageObjectKeyValue({
        primaryKey: this._localStorageSettings.primaryKey,
        subKey: this._localStorageSettings.subKey,
        value: initialEmittedNotifications
      });
    } else {
      // If there are notification in local storage, update the list in the client side
      this.store.setStorageObjectKeyValue({
        primaryKey: this._localStorageSettings.primaryKey,
        subKey: this._localStorageSettings.subKey,
        value: this.diffNotifications([...notificationsInLocalStorage.data], this._events as NotificationProperties[])
      });
    }

    // Store any active notifications. The service will take care of dispatching these to the notification module
    this._store = this.getActiveNotifications(
      this.store.getStorage({
        primaryKey: this._localStorageSettings.primaryKey
      })
    ).map((property) => {
      return new Notification(property);
    });

    // Populate the Subject with the store contents. Will trigger all subscribers to the public notifications observable
    this._notifications.next([...this._store]);
  }

  /**
   * Migrates old format NotificationProperties[] to new EmittedNotification[] format.
   * This handles backward compatibility for existing client storage.
   *
   * @param oldData Array that might contain old format data
   * @returns EmittedNotification array in new format
   */
  private migrateStorageFormat(oldData: (NotificationProperties | EmittedNotification)[]): EmittedNotification[] {
    if (!oldData || oldData.length === 0) {
      return [];
    }

    // Check if the first item has the new format (has 'notification' and 'acknowledged' properties)
    const firstItem = oldData[0];
    const isNewFormat =
      firstItem && typeof firstItem === 'object' && 'notification' in firstItem && 'acknowledged' in firstItem;

    if (isNewFormat) {
      // Data is already in new format
      return oldData as EmittedNotification[];
    }

    // Data is in old format, migrate it
    console.log('Migrating notification storage from old format to new format');
    return (oldData as NotificationProperties[]).map((item: NotificationProperties) => ({
      notification: {
        ...item,
        timeGenerated: item.timeGenerated || Date.now()
      },
      acknowledged: item.acknowledge === true
    }));
  }

  /**
   * Diffs latest and stored (client-side) notification objects and returns a new array of EmittedNotification
   * objects which are different (resetting any acknowledgement) or have not been found based on the latest
   * Notification events.
   *
   * @param stored Array from local storage that may be in old or new format
   * @param latest Latest NotificationProperties object array
   * @returns Diffed EmittedNotification array
   */
  private diffNotifications(
    stored: (NotificationProperties | EmittedNotification)[],
    latest: NotificationProperties[]
  ): EmittedNotification[] {
    // First, ensure stored data is in the correct format
    const migratedStored = this.migrateStorageFormat(stored);

    // Process latest notifications and merge with stored
    const processedLatest = latest.map((n) => {
      const existsInStored = migratedStored.find((ne) => {
        return n.id === ne.notification.id;
      });
      // Return early if the current latest does not exist in stored by id
      if (!existsInStored) {
        return {
          notification: {
            ...n,
            timeGenerated: n.timeGenerated || Date.now()
          },
          acknowledged: false
        };
      }

      // We'd rather keep the one stored in the store because it will already have the `acknowledged` key value set.
      // This prevents the same popup
      // appearing every time the user refreshes the application page.
      //
      // If a popup has already been acknowledged before, and there are no changes with the `latest` object,
      // then do not show the popup again.
      const preferredPass = this.diffObject(existsInStored.notification, n);

      if (preferredPass) {
        return existsInStored;
      } else {
        return {
          notification: {
            ...n,
            timeGenerated: n.timeGenerated || Date.now()
          },
          acknowledged: false
        };
      }
    });

    // Find acknowledged notifications that are not in the latest list (e.g., toast notifications)
    // and preserve them so they don't get lost
    const acknowledgedNotInLatest = migratedStored.filter((stored) => {
      const isAcknowledged = stored.acknowledged;
      const notInLatest = !latest.some((latest) => latest.id === stored.notification.id);
      return isAcknowledged && notInLatest;
    });

    // Combine processed latest notifications with preserved acknowledged notifications
    return [...processedLatest, ...acknowledgedNotInLatest];
  }

  /**
   * Diffs latest and stored (client-side) notification objects and returns a new array of EmittedNotification
   * objects which are different (resetting any acknowledgement) or have not been found based on the latest
   * Notification events.
   *
   * @param stored EmittedNotification object array from local storage (may be in old format)
  /**
   * Diffs two objects by key values. Able to diff recursively.
   *
   * Diffs by providing preferred and fallback object where the preferred object is tested against the fallback by key
   * size and values.
   *
   * If all conditions against the preferred object pass, the test will pass.
   *
   * If any one condition against the preferred object does not pass, the whole test will fail.
   */
  private diffObject(preferred: object, fallback: object): boolean {
    const keyLengthIsSame = Object.keys(fallback).length === Object.keys(preferred).length;
    // Return false if he current latest key length is different than the stored
    if (!keyLengthIsSame) {
      return false;
    }

    const keyValuesAreSame = Object.keys(preferred).every((k) => {
      const sameType = fallback[k] !== undefined && typeof fallback[k] === typeof preferred[k];
      // Check key value type is the same on both. Return false if not
      if (!sameType) {
        return false;
      }

      if (fallback[k] instanceof Array) {
        // If the current key value has type of Array, check each items value
        return fallback[k].every((value, index) => {
          return value === preferred[k][index];
        });
      } else if (fallback[k].constructor.name === 'Object' && preferred[k].constructor.name === 'Object') {
        // If the current key value is of type Object, diff that object.
        return this.diffObject(preferred[k], fallback[k]);
      } else {
        // Do not treat a notification object different if the only changed property is the acknowledge key
        if (k === 'acknowledge') {
          return true;
        }

        // If the current key value is of any other type than Array, check value only.
        return fallback[k] !== undefined && fallback[k] === preferred[k];
      }
    });

    // If any part of the latest notification object is different than the stored one, replace with latest
    if (!keyValuesAreSame) {
      return false;
    }

    return true;
  }

  /**
   * Gets active notification based on date range and acknowledgement status
   *
   * @param notifications LocalStorageObject with data that may be in old or new format
   */
  private getActiveNotifications(notifications: LocalStorageObject): NotificationProperties[] {
    if (!notifications.data) {
      return [];
    }

    // Migrate data to new format if necessary
    const migratedData = this.migrateStorageFormat(notifications.data);
    const flattened = migratedData.flat();

    if (flattened.length === 0) {
      return [];
    }

    // For notifications with a range, return those for which the current date is active and not acknowledged.
    const rangeActive: NotificationProperties[] = flattened
      .filter((e: EmittedNotification) => {
        return (
          !e.acknowledged &&
          e.notification.range &&
          e.notification.range.length === 2 &&
          Date.now() >= e.notification.range[0] &&
          Date.now() <= e.notification.range[1]
        );
      })
      .map((e: EmittedNotification) => e.notification);

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
      const currentLocalStorage: LocalStorageObject = this.store.getStorage<LocalStorageObject>({
        primaryKey: this._localStorageSettings.primaryKey
      });

      if (!currentLocalStorage.data) {
        return false;
      }

      // Use the migration logic to ensure we can handle both old and new formats
      const migratedData = this.migrateStorageFormat(currentLocalStorage.data);

      // Check if any notification with this ID has been acknowledged
      const isAcknowledged = migratedData.some(
        (item: EmittedNotification) => item.notification.id === notificationId && item.acknowledged === true
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
    const emittedNotification: EmittedNotification = {
      notification: {
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
    const currentLocalStorage: LocalStorageObject = this.store.getStorage<LocalStorageObject>({
      primaryKey: this._localStorageSettings.primaryKey
    });

    let local: EmittedNotification[] = this.migrateStorageFormat(currentLocalStorage.data || []);

    // Check if the notification already exists in local storage
    const existingNotificationIndex = local.findIndex((n: EmittedNotification) => n.notification.id === notification.id);

    if (existingNotificationIndex >= 0) {
      // Update existing notification to mark it as acknowledged
      local = local.map((n: EmittedNotification) => {
        if (n.notification.id === notification.id) {
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
      subKey: this._localStorageSettings.subKey,
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
    const match: NotificationProperties = this._events.find((n) => n.id === id);

    // If the referenced event by id was found, append it to the store and give the updated value to the subject
    if (match) {
      const obj = Object.assign({}, match);

      const notification = new Notification(obj);

      this._store = [...this._store, notification];
      this._notifications.next([...this._store]);
    } else {
      console.warn('Could not emit notification because the referenced item does not exist');
    }
  }
}

interface LocalStorageObject {
  data: (NotificationProperties | EmittedNotification)[];
}
