import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { MapViewfinderComponent } from './viewfinder.component';

/**
 * The keyboard viewfinder: moving the map with the arrow keys lists the buildings under the box in the
 * middle of the map, to be chosen by number.
 */
describe('MapViewfinderComponent', () => {
  /** The view's key-up handler, so a test can press a key. */
  let keyUp: (event: object) => void;

  /** What the viewfinder's polygon was made from, and the query it was used in. */
  let polygon: { rings: number[][][]; spatialReference: object };
  const queryFeatures = vi.fn(() => Promise.resolve({ features: [{ attributes: { BldgName: 'Evans Library' } }] }));

  class Polygon {
    constructor(properties: typeof polygon) {
      polygon = properties;
    }
  }

  /**
   * Stands in for a 2D view on dev's campus basemap, in Texas Centric (wkid 32139), where Esri leaves a
   * point's longitude and latitude null.
   */
  const view = {
    container: { offsetTop: 0 },
    spatialReference: { wkid: 32139 },
    toMap: vi.fn(({ x, y }: { x: number; y: number }) => ({
      x: 1082000 + x,
      y: 3111000 - y,
      longitude: null,
      latitude: null,
      spatialReference: { wkid: 32139 }
    })),
    on: vi.fn((name: string, handler: (event: object) => void) => {
      if (name === 'key-up') {
        keyUp = handler;
      }

      return { remove: vi.fn() };
    })
  };

  async function create() {
    TestBed.configureTestingModule({
      imports: [MapViewfinderComponent],
      providers: [
        {
          provide: EsriMapService,
          useValue: { store: of({ map: {}, view }), findLayerOrCreateFromSource: () => Promise.resolve({ queryFeatures }) }
        },
        { provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([Polygon]) } },
        { provide: EnvironmentService, useValue: { value: () => [{ id: 'buildings-layer' }] } }
      ]
    });

    const fixture = TestBed.createComponent(MapViewfinderComponent);

    fixture.componentRef.setInput('layer', 'buildings-layer');
    fixture.componentRef.setInput('template', '{attributes.BldgName}');
    fixture.detectChanges();

    return fixture;
  }

  it('lists the buildings under the viewfinder on a basemap in a projected reference (#1875)', async () => {
    const fixture = await create();

    keyUp({ key: 'ArrowUp' });

    // The viewfinder waits a tick before reading the screen, then loads Polygon and queries the layer.
    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    fixture.detectChanges();

    // The polygon is in the view's own reference, so it needs no longitude or latitude.
    expect(polygon.spatialReference).toBe(view.spatialReference);
    expect(polygon.rings[0]).toHaveLength(5);
    expect(polygon.rings[0].flat().every((coordinate) => Number.isFinite(coordinate))).toBe(true);
    expect(queryFeatures).toHaveBeenCalledWith(expect.objectContaining({ geometry: expect.any(Polygon) }));
    expect(fixture.nativeElement.textContent).toContain('Evans Library');
  });
});
