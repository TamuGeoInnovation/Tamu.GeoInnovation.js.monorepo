import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { getApplicationRoute } from '../components/discover.utils';
import { EventMapsComponent } from '../components/event-maps/event-maps.component';
import { discoverRoutes } from '../discover.routes';
import { DiscoveryService } from '../services/discovery/discovery.service';
import { MainMapDiscoverApplications } from './main-map-discover-applications';

/**
 * The bus map is the main map with the bus panel open (#2743): a route of the main map, `/map/d/bus`, listed in the
 * Transportation section, rather than a definition that would restate the main map's layers.
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

  // Development-only, as the Bus Routes panel is, until the maintainer moves bus routes to production (#1229).
  it('is not among the maps listed on production', () => {
    expect(new DiscoveryService().getVisibleInternalDiscoverApplications().map((app) => app.id)).not.toContain('bus-routes');
  });

  describe('on the Transportation page', () => {
    const transportation = discoverRoutes.find((route) => route.path === 'transportation');

    async function entries(isTesting: boolean): Promise<Array<{ text: string; href: string | null }>> {
      await TestBed.configureTestingModule({
        imports: [RouterTestingModule, EventMapsComponent],
        providers: [
          { provide: ActivatedRoute, useValue: { snapshot: { data: transportation.data } } },
          { provide: TestingService, useValue: { isTesting, get: () => of(isTesting) } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

      const fixture = TestBed.createComponent(EventMapsComponent);

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

    it('is not listed where they are off', async () => {
      expect((await entries(false)).map((entry) => entry.href)).not.toContain('/map/d/bus');
    });
  });
});
