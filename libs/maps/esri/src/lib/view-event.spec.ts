import { Subject, Subscription } from 'rxjs';

import { MapServiceInstance } from './services/map/map.service';
import { viewEvent, viewEventFromStore } from './view-event';

/**
 * A stand-in for a map view: it records what was registered and whether the handle was removed, which is the whole
 * contract `view.on` has with its callers.
 */
function fakeView(options: { handOverHandle?: boolean } = {}) {
  const handOverHandle = options.handOverHandle ?? true;
  const registered: Array<{ name: string; handler: (value: unknown) => void }> = [];
  let removed = 0;

  const view = {
    on: (name: string, handler: (value: unknown) => void) => {
      registered.push({ name, handler });

      // A view that has not handed a handle back yet is the case the hand-written copies threw on (#3493).
      return handOverHandle ? { remove: () => void removed++ } : (undefined as unknown as __esri.Handle);
    }
  } as unknown as MapServiceInstance['view'];

  return {
    view,
    registered,
    emit: (value: unknown) => registered.forEach(({ handler }) => handler(value)),
    get removals() {
      return removed;
    }
  };
}

describe('viewEvent', () => {
  it('registers a handler for the event it was given', () => {
    const fake = fakeView();
    const sub = viewEvent(fake.view, 'immediate-click').subscribe();

    expect(fake.registered.map(({ name }) => name)).toEqual(['immediate-click']);
    sub.unsubscribe();
  });

  it('emits what the view hands its handler', () => {
    const fake = fakeView();
    const seen: unknown[] = [];
    const sub = viewEvent<{ mapPoint: string }>(fake.view, 'click').subscribe((event) => seen.push(event));

    fake.emit({ mapPoint: 'a' });
    fake.emit({ mapPoint: 'b' });

    expect(seen).toEqual([{ mapPoint: 'a' }, { mapPoint: 'b' }]);
    sub.unsubscribe();
  });

  it('removes the handle when the subscription ends', () => {
    const fake = fakeView();
    const sub = viewEvent(fake.view, 'key-up').subscribe();

    expect(fake.removals).toBe(0);
    sub.unsubscribe();
    expect(fake.removals).toBe(1);
  });

  it('does not throw when the subscription ends before a handle arrived', () => {
    const fake = fakeView({ handOverHandle: false });
    const sub = viewEvent(fake.view, 'click').subscribe();

    // The fault the copies carried: `handle.remove()` on an undefined handle.
    expect(() => sub.unsubscribe()).not.toThrow();
  });

  it('registers again for a second subscriber, so two readers do not share one handle', () => {
    const fake = fakeView();
    const first = viewEvent(fake.view, 'click').subscribe();
    const second = viewEvent(fake.view, 'click').subscribe();

    expect(fake.registered.length).toBe(2);

    first.unsubscribe();
    expect(fake.removals).toBe(1);
    second.unsubscribe();
    expect(fake.removals).toBe(2);
  });
});

describe('viewEventFromStore', () => {
  it('skips an emission that carries no view', () => {
    const store = new Subject<MapServiceInstance>();
    const seen: unknown[] = [];
    const sub = viewEventFromStore(store, 'click').subscribe((event) => seen.push(event));

    // The trip planner service read `instances?.view` and then called `on` on it, so this threw (#3493).
    expect(() => store.next(undefined as unknown as MapServiceInstance)).not.toThrow();
    expect(() => store.next({ view: undefined } as unknown as MapServiceInstance)).not.toThrow();
    expect(seen).toEqual([]);

    sub.unsubscribe();
  });

  it('emits the events of the view the store carries', () => {
    const store = new Subject<MapServiceInstance>();
    const fake = fakeView();
    const seen: unknown[] = [];
    const sub = viewEventFromStore<string>(store, 'click').subscribe((event) => seen.push(event));

    store.next({ view: fake.view } as MapServiceInstance);
    fake.emit('clicked');

    expect(seen).toEqual(['clicked']);
    sub.unsubscribe();
  });

  it('moves to the new view when the store swaps one, and lets the old handle go', () => {
    const store = new Subject<MapServiceInstance>();
    const first = fakeView();
    const second = fakeView();
    const seen: unknown[] = [];
    const sub: Subscription = viewEventFromStore<string>(store, 'click').subscribe((event) => seen.push(event));

    store.next({ view: first.view } as MapServiceInstance);
    store.next({ view: second.view } as MapServiceInstance);

    expect(first.removals).toBe(1);

    first.emit('old view');
    second.emit('new view');

    expect(seen).toEqual(['new view']);
    sub.unsubscribe();
    expect(second.removals).toBe(1);
  });
});
