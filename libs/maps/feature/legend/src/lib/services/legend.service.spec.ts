import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { LegendService, showsInLegend } from './legend.service';

describe('showsInLegend', () => {
  it('shows a listed layer', () => {
    expect(showsInLegend({ listMode: 'show' } as __esri.Layer)).toBe(true);
  });

  it('leaves out a layer hidden from the Layers list', () => {
    expect(showsInLegend({ listMode: 'hide' } as __esri.Layer)).toBe(false);
  });

  it('leaves out a listed layer whose legend is turned off', () => {
    // The Tailgating map's zone number circles can be toggled in the Layers list but have no legend
    // entry of their own.
    expect(showsInLegend({ listMode: 'show', legendEnabled: false } as unknown as __esri.Layer)).toBe(false);
  });
});

/** Just enough of an Esri Collection for the legend. */
class FakeCollection<T> {
  constructor(private items: T[]) {}

  public filter(fn: (item: T) => boolean) {
    return new FakeCollection(this.items.filter(fn));
  }

  public map<U>(fn: (item: T) => U) {
    return new FakeCollection(this.items.map(fn));
  }

  public toArray() {
    return [...this.items];
  }

  // A layer's visibility never changes the list, which keeps hidden layers.
  public on() {
    return { remove: () => undefined };
  }
}

describe('LegendService', () => {
  /** Watchers registered through the fake reactiveUtils, re-run by `changed`. */
  let watchers: Array<() => void>;

  const changed = () => watchers.forEach((watcher) => watcher());

  const layer = (id: string, visible: boolean) => ({ id, visible, listMode: 'show' }) as unknown as __esri.Layer;

  const legendFor = (layers: __esri.Layer[]) => {
    watchers = [];

    const activeLayerInfos = new FakeCollection(layers.map((l) => ({ layer: l }) as __esri.ActiveLayerInfo));

    class FakeLegendViewModel {
      public activeLayerInfos = activeLayerInfos;
    }

    const reactiveUtils = {
      watch: (getter: () => unknown, callback: (value: unknown) => void) => {
        let last = getter();
        const watcher = () => {
          const next = getter();

          if (next !== last) {
            last = next;
            callback(next);
          }
        };

        watchers.push(watcher);

        return { remove: () => (watchers = watchers.filter((w) => w !== watcher)) };
      }
    };

    TestBed.configureTestingModule({
      providers: [
        LegendService,
        {
          provide: EsriModuleProviderService,
          useValue: { require: () => Promise.resolve([FakeLegendViewModel, reactiveUtils]) }
        },
        { provide: EsriMapService, useValue: { store: new BehaviorSubject({ view: {} }) } },
        { provide: EnvironmentService, useValue: {} }
      ]
    });

    const shown: string[][] = [];
    const subscription = TestBed.inject(LegendService)
      .legend()
      .subscribe((infos) => shown.push(infos.map((info) => info.layer.id)));

    return { shown, subscription };
  };

  it('lists a layer that loaded hidden once it is switched on (#1857)', async () => {
    // Every layer on the main map loads hidden, and is switched on from the Layers list.
    const parking = layer('visitor-parking-layer', false);
    const { shown, subscription } = legendFor([parking, layer('construction_zone-layer', false)]);

    await new Promise((resolve) => setTimeout(resolve));
    expect(shown.at(-1)).toEqual([]);

    (parking as { visible: boolean }).visible = true;
    changed();

    expect(shown.at(-1)).toEqual(['visitor-parking-layer']);
    subscription.unsubscribe();
  });

  it('keeps a layer listed once it has been switched off', async () => {
    const kiosks = layer('visitor-kiosks', true);
    const { shown, subscription } = legendFor([kiosks]);

    await new Promise((resolve) => setTimeout(resolve));
    expect(shown.at(-1)).toEqual(['visitor-kiosks']);

    (kiosks as { visible: boolean }).visible = false;
    changed();

    expect(shown.at(-1)).toEqual(['visitor-kiosks']);
    subscription.unsubscribe();
  });
});
