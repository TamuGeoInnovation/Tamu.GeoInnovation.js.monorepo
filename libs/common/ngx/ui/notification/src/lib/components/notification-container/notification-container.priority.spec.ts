import { Notification } from '../../helpers/notification.helper';
import { NotificationContainerComponent } from './notification-container.component';

/**
 * Ordering of grouped notifications (#1194).
 *
 * `byPriority` is a pure static so this can be checked without rendering anything: the ordering is the
 * part with a rule behind it, and the part that would regress quietly. A grouped toast that silently
 * reorders looks fine in a screenshot.
 */

const make = (id: string, priority?: 'high' | 'normal') =>
  new Notification({ id, title: id, message: id, ...(priority ? { priority } : {}) });

describe('NotificationContainerComponent.byPriority', () => {
  it('puts high priority first', () => {
    const ordered = NotificationContainerComponent.byPriority([make('a'), make('urgent', 'high'), make('b')]);

    expect(ordered.map((n) => n.id)).toEqual(['urgent', 'a', 'b']);
  });

  it('keeps arrival order within the same priority', () => {
    const ordered = NotificationContainerComponent.byPriority([make('a'), make('b'), make('c')]);

    expect(ordered.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps arrival order among several high priority notifications', () => {
    const ordered = NotificationContainerComponent.byPriority([
      make('first', 'high'),
      make('ordinary'),
      make('second', 'high')
    ]);

    expect(ordered.map((n) => n.id)).toEqual(['first', 'second', 'ordinary']);
  });

  it('treats an unset priority as normal', () => {
    // The Notification constructor defaults it, so an unset priority must not sort above `normal`.
    const ordered = NotificationContainerComponent.byPriority([make('unset'), make('explicit', 'normal')]);

    expect(ordered.map((n) => n.id)).toEqual(['unset', 'explicit']);
  });

  it('does not change the array it was given', () => {
    const items = [make('a'), make('urgent', 'high')];
    NotificationContainerComponent.byPriority(items);

    expect(items.map((n) => n.id)).toEqual(['a', 'urgent']);
  });
});
