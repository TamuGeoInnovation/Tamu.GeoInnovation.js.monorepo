import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlSegment, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { BuilderAccessGuard } from './builder-access.guard';
import { EventSettingsService } from '../../services/settings/event-settings.service';

describe('BuilderAccessGuard', () => {
  let guard: BuilderAccessGuard;
  let router: Router;
  let eventSettingsService: { validateEventQueryParams: jest.Mock; hasOptions: boolean };

  beforeEach(() => {
    eventSettingsService = {
      validateEventQueryParams: jest.fn(),
      hasOptions: false
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        BuilderAccessGuard,
        { provide: EventSettingsService, useValue: eventSettingsService }
      ]
    });

    guard = TestBed.inject(BuilderAccessGuard);
    router = TestBed.inject(Router);
  });

  it('should allow access when the event has configurable options', () => {
    eventSettingsService.hasOptions = true;

    const result = guard.canActivate({} as ActivatedRouteSnapshot);

    expect(result).toBe(true);
  });

  it('should redirect to the map when the event has no configurable options', () => {
    const eventRoute = {
      pathFromRoot: [
        { url: [] },
        { url: [new UrlSegment('parking', {})] },
        { url: [new UrlSegment('avp-parking', {})] }
      ]
    } as unknown as ActivatedRouteSnapshot;

    const route = {
      parent: eventRoute,
      queryParams: { foo: 'bar' },
      fragment: 'legend'
    } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route) as UrlTree;

    expect(eventSettingsService.validateEventQueryParams).toHaveBeenCalledWith(eventRoute, true);
    expect(router.serializeUrl(result)).toBe('/parking/avp-parking/map?foo=bar#legend');
  });
});
