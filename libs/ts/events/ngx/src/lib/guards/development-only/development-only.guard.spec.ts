import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { DevelopmentOnlyMapGuard } from './development-only.guard';
import { EventSettingsService } from '../../services/settings/event-settings.service';
import { EventDefinitions } from '../../definitions/all.definitions';

/**
 * A development-only map stays off production (#2712): its link must not open it, or production would request
 * services nobody has agreed to publish. Maps are looked up in the real definitions, so the map's own
 * `developmentOnly` is what is tested, not a stand-in for it.
 */
describe('DevelopmentOnlyMapGuard', () => {
  function guardOn(isTesting: boolean): { guard: DevelopmentOnlyMapGuard; router: Router } {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: TestingService, useValue: { isTesting } },
        {
          provide: EventSettingsService,
          useValue: {
            getEventDefinitionById: (id: string) =>
              EventDefinitions.find((definition) => definition.configuration?.id === id) ?? null
          }
        }
      ]
    });

    return { guard: TestBed.inject(DevelopmentOnlyMapGuard), router: TestBed.inject(Router) };
  }

  const linkTo = (eventId: string) => ({ params: { eventId } }) as unknown as ActivatedRouteSnapshot;

  it('sends a link to a development-only map to the main map on production', () => {
    const { guard, router } = guardOn(false);

    const result = guard.canActivate(linkTo('micromobility'));

    expect(result instanceof UrlTree && router.serializeUrl(result)).toBe('/map');
  });

  it('opens a development-only map where development-only features are on', () => {
    expect(guardOn(true).guard.canActivate(linkTo('micromobility'))).toBe(true);
  });

  it('opens every other map on production', () => {
    expect(guardOn(false).guard.canActivate(linkTo('visitor-parking'))).toBe(true);
  });
});
