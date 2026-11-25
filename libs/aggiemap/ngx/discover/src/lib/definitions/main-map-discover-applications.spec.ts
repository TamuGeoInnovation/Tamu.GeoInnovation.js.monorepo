import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { getApplicationRoute } from '../components/discover.utils';
import { ParkingMapsComponent } from '../components/parking-maps/parking-maps.component';
import { DiscoveryService } from '../services/discovery/discovery.service';
import { MainMapDiscoverApplications } from './main-map-discover-applications';

/**
 * The bus map is the main map with the bus panel open (#2743): a route of the main map, `/map/d/bus`, listed with the
 * transportation maps, rather than a definition that would restate the main map's layers.
 */
describe('the bus map (#2743)', () => {
  const bus = MainMapDiscoverApplications.find((app) => app.id === 'bus-routes');

  it('opens the main map on its bus panel', () => {
    expect(getApplicationRoute(bus)).toEqual(['/map', 'd', 'bus']);
  });

  it('is listed with the maps, under Transportation, and is no map definition', () => {
    const listed = new DiscoveryService().getInternalDiscoverApplications().find((app) => app.id === 'bus-routes');

    expect(listed).toBe(bus);
    expect(listed.mapTypes).toEqual(['transportation']);
    expect(listed.configuration).toBeUndefined();
  });

  // Hidden from production until #2895. The Bus Routes panel itself moved there on 9 November (#2789), which left its
  // listing hidden for no reason of its own, so it is listed everywhere now.
  it('is among the maps listed on production', () => {
    expect(new DiscoveryService().getVisibleInternalDiscoverApplications().map((app) => app.id)).toContain('bus-routes');
  });

  /**
   * It was listed on the Transportation page until #2895 folded that section into Parking & Transportation. The page
   * is `ParkingMapsComponent` now, which builds its two sections from `mapTypes` rather than from route data, so the
   * test reads the rendered links as a visitor would rather than asserting the grouping directly.
   */
  describe('on the Parking & Transportation page', () => {
    async function entries(isTesting: boolean): Promise<Array<{ text: string; href: string | null }>> {
      await TestBed.configureTestingModule({
        imports: [RouterTestingModule, ParkingMapsComponent],
        providers: [{ provide: TestingService, useValue: { isTesting, get: () => of(isTesting) } }],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      const fixture = TestBed.createComponent(ParkingMapsComponent);

      fixture.detectChanges();

      return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a.map-entry')).map((link) => ({
        text: (link.textContent ?? '').replace(/\s+/g, ' ').trim(),
        href: link.getAttribute('href')
      }));
    }

    afterEach(() => TestBed.resetTestingModule());

    it('is listed where development-only features are on, linking to the bus panel', async () => {
      expect(await entries(true)).toContainEqual(expect.objectContaining({ href: '/map/d/bus' }));
    });

    // The change #2895 makes: it is there on production too, not only where development features are on.
    it('is listed where they are off, linking to the bus panel', async () => {
      expect(await entries(false)).toContainEqual(expect.objectContaining({ href: '/map/d/bus' }));
    });

    it('lists the other two transportation maps beside it', async () => {
      const hrefs = (await entries(false)).map((entry) => entry.href);

      expect(hrefs).toContain('/transportation/micromobility');
      expect(hrefs).toContain('/transportation/sustainable-transportation');
    });
  });
});
