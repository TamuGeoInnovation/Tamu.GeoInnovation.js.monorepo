import { BehaviorSubject } from 'rxjs';

import { NotificationGroupedComponent } from './notification-grouped.component';
import { Notification } from '../../helpers/notification.helper';
import { NotificationService } from '../../services/notification.service';

/**
 * Acting on one grouped alert clears the batch (#1246).
 *
 * The component is instantiated by hand rather than through a `TestBed`: `actionGroupItem` is the
 * whole subject, and the thing that regressed is which notifications are left in the service
 * afterwards, not anything rendered.
 *
 * The fake service is a filtering store behind a subject, like the real one, so the group's own
 * subscription sees the removals - a stub that only recorded calls would pass even if the component
 * removed an item that was never in the group.
 */

const make = (id: string, action?: { type: string; value: string }) =>
  new Notification({ id, title: id, message: id, ...(action ? { action } : {}) });

class FakeModalService {
  public readonly open$ = new BehaviorSubject<boolean>(false);
  public readonly isOpen = this.open$.asObservable();
}

class FakeNotificationService {
  public readonly notifications: BehaviorSubject<Notification[]>;

  constructor(initial: Notification[]) {
    this.notifications = new BehaviorSubject(initial);
  }

  public remove(notification: Notification): void {
    this.notifications.next(this.notifications.value.filter((n) => n !== notification));
  }

  public get remaining(): string[] {
    return this.notifications.value.map((n) => n.id);
  }
}

describe('NotificationGroupedComponent.actionGroupItem', () => {
  let service: FakeNotificationService;
  let modal: FakeModalService;
  let navigated: unknown[][];
  let component: NotificationGroupedComponent;

  const build = (items: Notification[]) => {
    service = new FakeNotificationService(items);
    modal = new FakeModalService();
    navigated = [];
    const router = { navigate: (commands: unknown[]) => navigated.push(commands) };

    component = new NotificationGroupedComponent(
      null as never,
      router as never,
      modal as never,
      service as unknown as NotificationService
    );
    component.ngOnInit();

    return component;
  };

  afterEach(() => {
    component?.ngOnDestroy();
  });

  it('clears the notifications the user did not click, not only the one they did', () => {
    const clicked = make('ring-day', { type: 'route', value: '/ts/ringday' });
    build([clicked, make('bonfire'), make('parking')]);

    component.actionGroupItem(clicked);

    // Before the fix, 'bonfire' and 'parking' survived the navigation and were shown again on the
    // destination map, because the service is root-scoped.
    expect(service.remaining).toEqual([]);
  });

  it('still navigates to the clicked alert destination', () => {
    const clicked = make('ring-day', { type: 'route', value: '/ts/ringday' });
    build([make('bonfire'), clicked]);

    component.actionGroupItem(clicked);

    expect(navigated).toEqual([['/ts/ringday']]);
  });

  it('removes the notifications synchronously, so the destination cannot render them first', () => {
    // `closeGroup` animates out and removes 300ms later. That window is long enough for the
    // destination route to render the stale toasts, which is the fault in #1246, so this path must
    // not borrow it.
    const clicked = make('ring-day', { type: 'route', value: '/ts/ringday' });
    build([clicked, make('bonfire')]);

    component.actionGroupItem(clicked);

    expect(service.remaining).toEqual([]);
    expect(navigated.length).toBe(1);
  });

  it('does nothing at all for a notification with no action', () => {
    const plain = make('bonfire');
    build([plain, make('parking')]);

    component.actionGroupItem(plain);

    expect(service.remaining).toEqual(['bonfire', 'parking']);
    expect(navigated).toEqual([]);
  });
});

/**
 * Holding the stack back while a modal is open (#1246).
 *
 * An event map can open a venue change or an event-passed warning as it loads. The toasts must not
 * draw underneath it, and must not expire behind it either - someone who dismisses the modal after
 * fifteen seconds should still find them there.
 */
describe('NotificationGroupedComponent, while a modal is open', () => {
  let modal: FakeModalService;
  let component: NotificationGroupedComponent;

  const build = (items: Notification[]) => {
    modal = new FakeModalService();

    component = new NotificationGroupedComponent(
      null as never,
      null as never,
      modal as never,
      new FakeNotificationService(items) as unknown as NotificationService
    );
    component.ngOnInit();

    return component;
  };

  afterEach(() => {
    component?.ngOnDestroy();
  });

  it('is not blocked when no modal is open', () => {
    build([make('bonfire')]);

    expect(component.blockedByModal).toBe(false);
  });

  it('is blocked as soon as a modal opens', () => {
    build([make('bonfire')]);

    modal.open$.next(true);

    expect(component.blockedByModal).toBe(true);
  });

  it('keeps the notifications rather than discarding them', () => {
    build([make('bonfire'), make('parking')]);

    modal.open$.next(true);

    expect(component.groupedItems.map((n) => n.id)).toEqual(['bonfire', 'parking']);
  });

  it('shows them again once the modal closes', () => {
    build([make('bonfire')]);

    modal.open$.next(true);
    modal.open$.next(false);

    expect(component.blockedByModal).toBe(false);
    expect(component.groupedItems.map((n) => n.id)).toEqual(['bonfire']);
  });

  it('stops the countdown while blocked, so the stack cannot expire behind the modal', () => {
    jest.useFakeTimers();

    try {
      build([make('bonfire')]);
      modal.open$.next(true);

      // Well past the 10s auto-dismiss.
      jest.advanceTimersByTime(30000);

      expect(component.groupedItems.map((n) => n.id)).toEqual(['bonfire']);
      expect(component.groupTimerPercent).toBeLessThan(100);
    } finally {
      jest.useRealTimers();
    }
  });

  it('survives having no modal service at all', () => {
    // The component is `@Optional()` on ModalService: twelve other applications render notifications
    // and must not be made to depend on the modal library.
    component = new NotificationGroupedComponent(
      null as never,
      null as never,
      null as never,
      new FakeNotificationService([make('bonfire')]) as unknown as NotificationService
    );

    expect(() => component.ngOnInit()).not.toThrow();
    expect(component.blockedByModal).toBe(false);
  });
});
