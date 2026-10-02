import { BehaviorSubject } from 'rxjs';

import { NotificationGroupedComponent } from './notification-grouped.component';
import { Notification } from '../../helpers/notification.helper';
import { NotificationService } from '../../services/notification.service';

/**
 * The panel shows one notification at a time (#1327).
 *
 * Stacking every active notification made the panel as tall as the number of them - four of them
 * covered most of the map on a laptop, and more on a phone. The rest are reached with a stepper.
 *
 * Built by hand rather than through a `TestBed`, as the sibling specs here do: the subject is which
 * notification the panel considers current as the list changes underneath it, not anything rendered.
 */

const make = (id: string, priority?: 'high' | 'normal') =>
  new Notification({ id, title: id, message: id, ...(priority ? { priority } : {}) });

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
}

describe('stepping through grouped notifications', () => {
  let component: NotificationGroupedComponent;
  let service: FakeNotificationService;

  const build = (items: Notification[]) => {
    service = new FakeNotificationService(items);

    component = new NotificationGroupedComponent(
      null as never,
      { navigate: () => undefined } as never,
      new FakeModalService() as never,
      service as unknown as NotificationService
    );
    component.ngOnInit();

    return component;
  };

  afterEach(() => component?.ngOnDestroy());

  it('shows the first notification, not all of them', () => {
    build([make('a'), make('b'), make('c')]);

    expect(component.currentItem?.id).toBe('a');
    expect(component.groupIndex).toBe(0);
  });

  it('shows the highest priority one first, as the stack did', () => {
    // Ordering is what decides which single notification a visitor actually sees now, so it matters
    // more than it did when every one was on screen at once.
    build([make('a'), make('urgent', 'high'), make('b')]);

    expect(component.currentItem?.id).toBe('urgent');
  });

  it('steps forward and back', () => {
    build([make('a'), make('b'), make('c')]);

    component.nextItem();
    expect(component.currentItem?.id).toBe('b');

    component.nextItem();
    expect(component.currentItem?.id).toBe('c');

    component.previousItem();
    expect(component.currentItem?.id).toBe('b');
  });

  it('wraps at each end rather than dead-ending', () => {
    // The panel is dismissed by its timer or its close button, so a stepper that stopped on the last
    // item would simply look broken for the ten seconds it is up.
    build([make('a'), make('b')]);

    component.nextItem();
    component.nextItem();
    expect(component.currentItem?.id).toBe('a');

    component.previousItem();
    expect(component.currentItem?.id).toBe('b');
  });

  it('offers no stepper for a single notification', () => {
    build([make('only')]);

    expect(component.hasMultiple).toBe(false);
  });

  it('still shows something when the notification being viewed is removed', () => {
    // The list changes underneath this component - a notification is actioned, acknowledged, or its
    // own service clears it. Sitting on the last one and having it removed is the case that leaves
    // the panel rendering nothing if the index is trusted rather than clamped.
    const items = [make('a'), make('b'), make('c')];
    build(items);

    component.nextItem();
    component.nextItem();
    expect(component.currentItem?.id).toBe('c');

    service.remove(items[2]);

    expect(component.groupIndex).toBe(1);
    expect(component.currentItem?.id).toBe('b');
  });

  it('does not step past the end of a list that has shrunk', () => {
    const items = [make('a'), make('b')];
    build(items);

    service.remove(items[1]);
    component.nextItem();

    expect(component.currentItem?.id).toBe('a');
  });

  it('stays quiet when every notification has gone', () => {
    const items = [make('a')];
    build(items);

    service.remove(items[0]);

    expect(component.currentItem).toBeUndefined();
    expect(() => component.nextItem()).not.toThrow();
  });
});
