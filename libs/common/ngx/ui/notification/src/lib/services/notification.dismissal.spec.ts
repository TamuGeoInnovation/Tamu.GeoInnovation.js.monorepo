import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

import { NotificationService, AGGIEMAP_NOTIFICATION_STORE_KEY } from './notification.service';
import { Notification } from '../helpers/notification.helper';

/**
 * Remembering a dismissal for the rest of the page load, and no longer (#1246).
 *
 * In memory on purpose. A notification the user has dealt with must not be raised again as they move
 * between routes, and must come back on a reload - that is how someone asks to see the current
 * notices again, and a new service instance is exactly what a reload produces.
 */

/** Enough of `LocalStoreService` for the constructor and the acknowledge path. */
class FakeLocalStore {
  private _data: Record<string, unknown> = {};

  public getStorage<T>({ primaryKey }: { primaryKey: string }): T {
    return this._data[primaryKey] as T;
  }

  public setStorage<T>({ primaryKey, value }: { primaryKey: string; value: T }): void {
    this._data[primaryKey] = value;
  }

  public getStorageObjectKeyValue<T>({ primaryKey, subKey }: { primaryKey: string; subKey: string }): T {
    return (this._data[primaryKey] as Record<string, unknown>)?.[subKey] as T;
  }

  public setStorageObjectKeyValue({
    primaryKey,
    subKey,
    value
  }: {
    primaryKey: string;
    subKey: string;
    value: unknown;
  }): void {
    const existing = (this._data[primaryKey] as Record<string, unknown>) ?? {};
    this._data[primaryKey] = { ...existing, [subKey]: value };
  }
}

const build = () =>
  new NotificationService(
    new FakeLocalStore() as unknown as LocalStoreService,
    { value: () => undefined } as unknown as EnvironmentService,
    AGGIEMAP_NOTIFICATION_STORE_KEY
  );

const notification = (id: string) => new Notification({ id, title: id, message: id });

describe('NotificationService dismissal memory', () => {
  it('constructs when the application configures no notification events', () => {
    // `_events` is spread unconditionally while building the initial store. Left undefined, the
    // service threw as it was constructed and took the application down with it.
    expect(() => build()).not.toThrow();
  });

  it('reports nothing dismissed to begin with', () => {
    expect(build().wasDismissedThisLoad('ring-day-toast')).toBe(false);
  });

  it('remembers a notification that was removed', () => {
    const service = build();

    service.toast({ id: 'ring-day-toast', title: 'Ring Day', message: 'Ring Day' });
    service.remove(notification('ring-day-toast'));

    expect(service.wasDismissedThisLoad('ring-day-toast')).toBe(true);
  });

  it('does not report a different notification as dismissed', () => {
    const service = build();

    service.remove(notification('ring-day-toast'));

    expect(service.wasDismissedThisLoad('kickoff-toast')).toBe(false);
  });

  it('remembers an acknowledged notification too, since acknowledging removes it', () => {
    const service = build();

    service.acknowledge(notification('ring-day-toast'));

    expect(service.wasDismissedThisLoad('ring-day-toast')).toBe(true);
  });

  it('forgets everything in a new instance, which is what a page reload produces', () => {
    const first = build();
    first.remove(notification('ring-day-toast'));

    expect(build().wasDismissedThisLoad('ring-day-toast')).toBe(false);
  });

  it('still raises a transient toast that was dismissed earlier', () => {
    // `toast` deliberately does not consult the dismissal record. 'URL Copied' has to appear every
    // time the user copies a URL, however many times they dismissed it before.
    //
    // The notification handed to `remove` is the one the service emitted, not a freshly built stand-in:
    // `remove` matches on id *and* `timeGenerated`, so a stand-in only removes anything when both
    // `Date.now()` calls happen to land in the same millisecond. Built that way this passed locally
    // and failed on CI.
    const service = build();
    const seen: Notification[][] = [];
    service.notifications.subscribe((items) => seen.push(items));

    service.toast({ id: 'url-copied', title: 'URL Copied', message: 'Copied' });

    const raised = seen[seen.length - 1];
    expect(raised.map((n) => n.id)).toEqual(['url-copied']);

    service.remove(raised[0]);
    expect(seen[seen.length - 1]).toEqual([]);

    service.toast({ id: 'url-copied', title: 'URL Copied', message: 'Copied' });

    expect(seen[seen.length - 1].map((n) => n.id)).toEqual(['url-copied']);
  });

  it('removes only the notification it was given, matching how it was raised', () => {
    // Guards the trap above directly: a stand-in with the same id but a different `timeGenerated`
    // must not be treated as the raised notification.
    const service = build();
    const seen: Notification[][] = [];
    service.notifications.subscribe((items) => seen.push(items));

    service.toast({ id: 'url-copied', title: 'URL Copied', message: 'Copied' });
    const raised = seen[seen.length - 1][0];

    expect(raised.timeGenerated).toBeDefined();
    service.remove(raised);

    expect(seen[seen.length - 1]).toEqual([]);
  });
});
