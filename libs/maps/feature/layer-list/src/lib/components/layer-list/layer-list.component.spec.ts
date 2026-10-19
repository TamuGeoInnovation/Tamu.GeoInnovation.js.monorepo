import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { LayerListService } from '../../services/layer-list.service';
import { LayerListComponent } from './layer-list.component';

interface FakeItem {
  title: string;
  layer: { id: string };
}

/**
 * The list is alphabetical by title, and a layer whose definition gives it no title takes its service's
 * name once it loads (#1939). On ArcGIS 5 the list's items exist before their layers load, so the list
 * was sorted once while most titles were still empty and kept that order: `/parking/ts-main-parking`
 * read "Construction, Route Stop/Start Points, Campus Stops, ..." on dev while production, on 4.27, read
 * them alphabetically.
 */
describe('LayerListComponent', () => {
  /** The watches the fake reactiveUtils holds. `changed` runs each one, as ArcGIS would after a change. */
  let watches: Array<{ check: () => void }>;
  let items: FakeItem[];

  const changed = () => watches.forEach((watch) => watch.check());

  const titles = (component: LayerListComponent) => component.layers().map((item) => item.title);

  const create = async () => {
    const component = TestBed.createComponent(LayerListComponent).componentInstance;

    await new Promise((resolve) => setTimeout(resolve));

    return component;
  };

  beforeEach(() => {
    watches = [];
    items = [];

    const reactiveUtils = {
      watch: (getter: () => unknown, callback: () => void) => {
        let last = getter();
        const watch = {
          check: () => {
            const next = getter();

            if (next !== last) {
              last = next;
              callback();
            }
          }
        };

        watches.push(watch);

        return { remove: () => (watches = watches.filter((w) => w !== watch)) };
      }
    };

    // The list's view model, reduced to the part of its `operationalItems` collection the service reads.
    class LayerListViewModel {
      public operationalItems = {
        get length() {
          return items.length;
        },
        map: <T>(fn: (item: FakeItem) => T) => ({ join: (separator: string) => items.map(fn).join(separator) }),
        toArray: () => [...items]
      };
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        LayerListService,
        {
          provide: EsriModuleProviderService,
          useValue: { require: () => Promise.resolve([LayerListViewModel, reactiveUtils]) }
        },
        { provide: EsriMapService, useValue: { store: of({ view: {} }) } }
      ]
    });

    TestBed.overrideComponent(LayerListComponent, { set: { template: '', imports: [] } });
  });

  it('sorts layers alphabetically once titles that arrive after the list was built are in', async () => {
    items = [
      { title: 'Construction', layer: { id: 'construction' } },
      { title: '', layer: { id: 'route-points' } },
      { title: '', layer: { id: 'campus-stops' } }
    ];

    const component = await create();

    // Drawn once while two titles are still empty, as the page draws the list before its layers load.
    expect(titles(component)).toEqual(['', '', 'Construction']);

    items[1].title = 'Route Stop/Start Points';
    items[2].title = 'Campus Stops';
    changed();

    expect(titles(component)).toEqual(['Campus Stops', 'Construction', 'Route Stop/Start Points']);
  });

  it('lists a layer added after the list was built', async () => {
    items = [{ title: 'Parking Lots', layer: { id: 'lots' } }];

    const component = await create();

    expect(titles(component)).toEqual(['Parking Lots']);

    items.push({ title: 'Campus Stops', layer: { id: 'stops' } });
    changed();

    expect(titles(component)).toEqual(['Campus Stops', 'Parking Lots']);
  });
});
