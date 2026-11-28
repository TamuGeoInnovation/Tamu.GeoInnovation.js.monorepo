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
 * The list is in the map's draw order, top first, which is the order its view model gives and the order the legend
 * shows (#1433). It was alphabetical, so the two panels put the same layers in different orders on one screen: Men's
 * Basketball's Layers read Closures, Icons, Parking above a legend reading Icons, Closures, Parking.
 *
 * A layer whose definition gives it no title takes its service's name once it loads (#1939). With no sort, a title
 * arriving late cannot leave the list in the wrong order, which is what #1939 was.
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

  it("keeps the map's draw order, not the titles' alphabetical order (#1433)", async () => {
    // Men's Basketball, top first, as the map draws them and the legend lists them.
    items = [
      { title: 'Basketball Icons', layer: { id: 'icons' } },
      { title: 'Basketball Closures', layer: { id: 'closures' } },
      { title: 'Basketball Parking', layer: { id: 'parking' } }
    ];

    const component = await create();

    expect(titles(component)).toEqual(['Basketball Icons', 'Basketball Closures', 'Basketball Parking']);
  });

  it('keeps the draw order once titles that arrive after the list was built are in (#1939)', async () => {
    items = [
      { title: 'Construction', layer: { id: 'construction' } },
      { title: '', layer: { id: 'route-points' } },
      { title: '', layer: { id: 'campus-stops' } }
    ];

    const component = await create();

    items[1].title = 'Route Stop/Start Points';
    items[2].title = 'Campus Stops';
    changed();

    expect(titles(component)).toEqual(['Construction', 'Route Stop/Start Points', 'Campus Stops']);
  });

  it('follows the map when its draw order changes', async () => {
    items = [
      { title: 'Lots', layer: { id: 'lots' } },
      { title: 'Spaces', layer: { id: 'spaces' } }
    ];

    const component = await create();

    items.reverse();
    changed();

    expect(titles(component)).toEqual(['Spaces', 'Lots']);
  });

  it('lists a layer added after the list was built', async () => {
    items = [{ title: 'Parking Lots', layer: { id: 'lots' } }];

    const component = await create();

    expect(titles(component)).toEqual(['Parking Lots']);

    items.unshift({ title: 'Campus Stops', layer: { id: 'stops' } });
    changed();

    expect(titles(component)).toEqual(['Campus Stops', 'Parking Lots']);
  });
});
