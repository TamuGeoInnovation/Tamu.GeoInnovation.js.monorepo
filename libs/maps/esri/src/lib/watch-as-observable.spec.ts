import { watchAsObservable } from './watch-as-observable';

import esri = __esri;

/**
 * A stand-in for `reactiveUtils`: it records what was watched and whether the handle was removed, which is the whole
 * contract `reactiveUtils.watch` has with its callers.
 */
function fakeReactiveUtils(options: { handOverHandle?: boolean } = {}) {
  const handOverHandle = options.handOverHandle ?? true;
  const watched: Array<{ read: () => unknown; callback: (value: unknown) => void }> = [];
  let removed = 0;

  const reactiveUtils = {
    watch: (read: () => unknown, callback: (value: unknown) => void) => {
      watched.push({ read, callback });

      // A watch that has not handed a handle back yet is the case both hand-written copies threw on (#3592).
      return handOverHandle ? { remove: () => void removed++ } : (undefined as unknown as esri.WatchHandle);
    }
  } as unknown as esri.reactiveUtils;

  return {
    reactiveUtils,
    watched,
    change: (value: unknown) => watched.forEach(({ callback }) => callback(value)),
    get removals() {
      return removed;
    }
  };
}

describe('watchAsObservable', () => {
  it('watches what it is given to read', () => {
    const fake = fakeReactiveUtils();
    const read = () => 'titles';
    const sub = watchAsObservable(fake.reactiveUtils, read).subscribe();

    expect(fake.watched.map((watch) => watch.read)).toEqual([read]);
    sub.unsubscribe();
  });

  it('emits each new value the watch reports, and nothing before the first change', () => {
    const fake = fakeReactiveUtils();
    const seen: string[] = [];
    const sub = watchAsObservable<string>(fake.reactiveUtils, () => '').subscribe((value) => seen.push(value));

    expect(seen).toEqual([]);

    fake.change('a\nb');
    fake.change('b\na');

    expect(seen).toEqual(['a\nb', 'b\na']);
    sub.unsubscribe();
  });

  it('removes the handle when the subscription ends', () => {
    const fake = fakeReactiveUtils();
    const sub = watchAsObservable(fake.reactiveUtils, () => 1).subscribe();

    expect(fake.removals).toBe(0);
    sub.unsubscribe();
    expect(fake.removals).toBe(1);
  });

  // The fault both hand-written copies shared: `handle.remove()` on a handle that was never handed over (#3592).
  it('does not throw when the subscription ends before the handle arrives', () => {
    const fake = fakeReactiveUtils({ handOverHandle: false });
    const sub = watchAsObservable(fake.reactiveUtils, () => 1).subscribe();

    expect(() => sub.unsubscribe()).not.toThrow();
  });

  it('watches afresh for each subscriber, and removes each handle once', () => {
    const fake = fakeReactiveUtils();
    const source = watchAsObservable(fake.reactiveUtils, () => 1);
    const first = source.subscribe();
    const second = source.subscribe();

    expect(fake.watched.length).toBe(2);
    first.unsubscribe();
    second.unsubscribe();
    first.unsubscribe();
    expect(fake.removals).toBe(2);
  });
});
