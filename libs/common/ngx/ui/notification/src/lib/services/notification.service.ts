import { Injectable, Optional, InjectionToken, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

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
      this.store.setStorageObjectKeyValue({
        primaryKey: this._localStorageSettings.primaryKey,
        subKey: this._localStorageSettings.subKey,
        value: this._events
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
   * Diffs latest and stored (client-side) notification objects and returns a new array of Notification
   * objects which are different (resetting any acknowledgement) or have not been found based on the latest
   * Notification events.
   *
   * @param stored Notification object array from local storage
   * @param latest Latest Notification object array
   * @returns Diffed Notification array
   */
  private diffNotifications(stored: NotificationProperties[], latest: NotificationProperties[]): NotificationProperties[] {
    // Compare latest and stored list, and get any notification objects with different properties or those that are not
    // stored in client storage
    return latest.map((n) => {
      const existsInStored = stored.find((ne) => {
        return n.id === ne.id;
      });
      // Return early if the current latest does not exist in stored by id
      if (!existsInStored) {
        return n;
      }

      // We'd rather keep the one stored in the store because it will already have the `acknowledge` key value set.
      // This prevents the same popup
      // appearing every time the user refreshes the application page.
      //
      // If a popup has already been acknowledged before, and there are no changes with the `latest` object,
      // then do not show the popup again.
      const preferredPass = this.diffObject(existsInStored, n);

      if (preferredPass) {
        return existsInStored;
      } else {
        return n;
      }
    });
  }

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
   * @param notifications Notification object array
   */
  private getActiveNotifications(notifications: LocalStorageObject): NotificationProperties[] {
    if (!notifications.data) {
      return;
    }

    const flattened = notifications.data.flat();

    if (flattened.length === 0) {
      return [];
    }

    // For notifications with a range, return those for which the current date is active.
    const rangeActive: NotificationProperties[] = flattened.filter((e) => {
      return (
        e.acknowledge === false && e.range && e.range.length === 2 && (Date.now() >= e.range[0] && Date.now() <= e.range[1])
      );
    });

    return [...rangeActive];
  }

  /**
   * Pushes a one-time notification message, triggering any subscribed listeners
   */
  public toast(properties: NotificationProperties): void {
    // const obj: Notification = new Notification(properties.id, properties.title, properties.message, Date.now());
    const obj: Notification = new Notification({
      id: properties.id,
      title: properties.title,
      message: properties.message,
      timeGenerated: Date.now()
    });

    this._store = [...this._store, obj];

    this._notifications.next([...this._store]);
  }

  /**
   * Removes a notification object from the service store, and updates the notifications subject
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

    // Create a new notification array for the client-stored notifications and update the acknowledge property
    // if the current notification object if it exists. In this way, it will not be be returned as an active
    // notification.
    const local: NotificationProperties[] = this.store
      .getStorage<LocalStorageObject>({ primaryKey: this._localStorageSettings.primaryKey })
      .data.map((n: Notification) => {
        if (n.id !== notification.id) {
          return n;
        }

        n.acknowledge = true;

        return n;
      });

    // Set new store list
    this._store = [...filtered];

    // Set the notifications subject value
    this._notifications.next([...filtered]);

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

export class Notification {
  public id: NotificationProperties['id'];
  public title: NotificationProperties['title'];
  public message: NotificationProperties['message'];
  public timeGenerated: NotificationProperties['timeGenerated'];
  public imgUrl: NotificationProperties['imgUrl'];
  public imgAltText: NotificationProperties['imgAltText'];
  public interval: NotificationProperties['interval'];
  public range: NotificationProperties['range'];
  public acknowledge: NotificationProperties['acknowledge'];
  public action: NotificationProperties['action'];

  constructor(properties: NotificationProperties) {
    this.id = properties.id || '';
    this.title = properties.title || '';
    this.message = properties.message || '';
    this.timeGenerated = properties.timeGenerated || Date.now();
    this.imgUrl = properties.imgUrl || '';
    this.imgAltText = properties.imgAltText || '';
    this.interval = properties.interval || 0;
    this.range = properties.range || [0, 0];
    this.acknowledge = properties.acknowledge || false;
    this.action = properties.action || undefined;
  }
}

interface LocalStorageObject {
  data: NotificationProperties[];
}

export interface NotificationProperties {
  /**
   * Unique notification identification. Can be used to call a preset.
   */
  id: string;

  /**
   * Title line displayed in the notification component.
   */
  title: string;

  /**
   * Notification message body.
   */
  message: string;

  /**
   * Describes whether the notification has been acknowledged by the user.
   * If false, it will be prompted every time unless it is a preset call.
   */
  acknowledge?: boolean;

  /**
   * Image URL for the notification icon.
   */
  imgUrl?: string;

  /**
   * Accessible text for the notification icon.
   */
  imgAltText?: string;

  /**
   * DO NOT SET.
   *
   * Value is set by the notification service that determines the start of the notification animation.
   */
  timeGenerated?: number;

  /**
   * Unknown ???
   */
  interval?: number;

  /**
   * Date ranges (unix time) during which notification item is active.
   */
  range?: number[];

  /**
   * Performs an action on notification element click.
   */
  action?: NotificationAction;
}

interface NotificationAction {
  type: string;
  value: string;
}
