import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { MapAddressGuard, mapSegment } from './map-address.guard';
import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventDefinitions } from '../../definitions/all.definitions';

/**
 * A map listed under Transportation is at `/transportation/<id>` (#2767). The section decides, so the address and the
 * listing cannot disagree; maps are looked up in the real definitions, so it is each map's own listing that is tested.
 */
describe('a map address', () => {
  const discoverOf = (id: string) => EventDefinitions.find((definition) => definition.configuration?.id === id)?.discover;

  it('is /transportation for every map listed under Transportation, and for no other', () => {
    const transportation = EventDefinitions.filter((definition) => definition.discover)
      .filter((definition) => mapSegment(definition.discover as NonNullable<typeof definition.discover>) === 'transportation')
      .map((definition) => definition.configuration?.id);

    expect(transportation).toEqual(expect.arrayContaining(['micromobility', 'sustainable-transportation']));
    expect(
      EventDefinitions.filter(
        (definition) =>
          definition.discover &&
          (definition.discover.mapTypes ?? [definition.discover.mapType]).includes('transportation') !==
            transportation.includes(definition.configuration?.id)
      )
    ).toEqual([]);
  });

  it('is unchanged for a parking map, an event and a satellite campus', () => {
    expect(mapSegment(discoverOf('visitor-parking') as NonNullable<ReturnType<typeof discoverOf>>)).toBe('parking');
    expect(mapSegment({ type: 'event' })).toBe('events');
    expect(mapSegment({ type: 'satellite-campus' })).toBe('campus');
  });
});

describe('MapAddressGuard', () => {
  function guard(): { guard: MapAddressGuard; router: Router } {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: EventSettingsService,
          useValue: {
            getEventDefinitionById: (id: string) =>
              EventDefinitions.find((definition) => definition.configuration?.id === id) ?? null
          }
        }
      ]
    });

    return { guard: TestBed.inject(MapAddressGuard), router: TestBed.inject(Router) };
  }

  const at = (url: string) => {
    const eventId = url.split('/')[2].split(/[?#]/)[0];

    return [{ params: { eventId } } as unknown as ActivatedRouteSnapshot, { url } as RouterStateSnapshot] as const;
  };

  it("moves a Transportation map's /parking address to /transportation, keeping the rest of it", () => {
    const { guard: g, router } = guard();
    const result = g.canActivate(...at('/parking/micromobility/map/d?zoom=17'));

    expect(result instanceof UrlTree && router.serializeUrl(result)).toBe('/transportation/micromobility/map/d?zoom=17');
  });

  it('opens a Transportation map at /transportation', () => {
    expect(guard().guard.canActivate(...at('/transportation/sustainable-transportation'))).toBe(true);
  });

  it('leaves every other map where it is, at any segment that has always worked', () => {
    const { guard: g } = guard();

    expect(g.canActivate(...at('/parking/visitor-parking'))).toBe(true);
    expect(g.canActivate(...at('/events/visitor-parking'))).toBe(true);
  });
});
