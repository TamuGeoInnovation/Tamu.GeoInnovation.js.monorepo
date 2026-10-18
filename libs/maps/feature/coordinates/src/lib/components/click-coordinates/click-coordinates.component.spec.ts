import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator.js';

import { EsriMapService } from '@tamu-gisc/maps/esri';

import { ClickCoordinatesComponent } from './click-coordinates.component';

// Esri's project operator, loaded only for a click in a projected reference. Mocked, so the test neither
// loads @arcgis/core's ES modules nor depends on the engine's WebAssembly.
const mockWGS84 = { wkid: 4326 };
vi.mock('@arcgis/core/geometry/operators/projectOperator.js', () => ({ load: vi.fn(), execute: vi.fn() }));
vi.mock('@arcgis/core/geometry/SpatialReference.js', () => ({ __esModule: true, default: { WGS84: mockWGS84 } }));

/**
 * The latitude and longitude of the last click on the map, shown bottom left on the main map.
 */
describe('ClickCoordinatesComponent', () => {
  /** Stands in for a view: `on('immediate-click')` hands back the handler, so a test can click. */
  let click: (mapPoint: object) => void;

  const view = {
    on: vi.fn((_name: string, handler: (event: object) => void) => {
      click = (mapPoint) => handler({ mapPoint });

      return { remove: vi.fn() };
    })
  };

  async function create() {
    TestBed.configureTestingModule({
      imports: [ClickCoordinatesComponent],
      providers: [{ provide: EsriMapService, useValue: { store: of({ map: {}, view }) } }]
    });

    const fixture = TestBed.createComponent(ClickCoordinatesComponent);

    fixture.detectChanges();

    return fixture;
  }

  async function settle(fixture: Awaited<ReturnType<typeof create>>) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  }

  it('shows the latitude and longitude of a click in Web Mercator', async () => {
    const fixture = await create();

    click({ x: -10724829.6, y: 3584134.3, longitude: -96.344672, latitude: 30.61306 });
    await settle(fixture);

    expect(fixture.nativeElement.textContent).toContain('Latitude: 30.61306');
    expect(fixture.nativeElement.textContent).toContain('Longitude: -96.34467');
    expect(projectOperator.execute).not.toHaveBeenCalled();
  });

  it('projects a click in a projected reference to latitude and longitude (#1875)', async () => {
    // Dev's main map in 2D is in Texas Centric (wkid 32139), where Esri leaves longitude and latitude null.
    const mapPoint = { x: 1082345.89, y: 3111767.64, longitude: null, latitude: null, spatialReference: { wkid: 32139 } };

    (projectOperator.load as Mock).mockResolvedValue(undefined);
    (projectOperator.execute as Mock).mockReturnValue({ x: -96.344672, y: 30.61306 });

    const fixture = await create();

    click(mapPoint);
    await settle(fixture);

    expect(projectOperator.execute).toHaveBeenCalledWith(mapPoint, mockWGS84);
    expect(fixture.nativeElement.textContent).toContain('Latitude: 30.61306');
    expect(fixture.nativeElement.textContent).toContain('Longitude: -96.34467');
  });
});
