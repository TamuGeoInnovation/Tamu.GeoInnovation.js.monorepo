import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEntryGuard } from './event-entry.guard';
import { EventSettingsService } from '../../services/settings/event-settings.service';

describe('EventEntryGuard', () => {
  let guard: EventEntryGuard;
  let router: Router;
  let eventSettingsService: {
    validateEventQueryParams: jest.Mock;
    hasOptions: boolean;
    hasFeatureSelectionQueryParams: jest.Mock;
  };

  beforeEach(() => {
    eventSettingsService = {
      validateEventQueryParams: jest.fn(),
      hasOptions: false,
      hasFeatureSelectionQueryParams: jest.fn().mockReturnValue(false)
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [EventEntryGuard, { provide: EventSettingsService, useValue: eventSettingsService }]
    });

    guard = TestBed.inject(EventEntryGuard);
    router = TestBed.inject(Router);
  });

  it('should redirect intro-only events directly to the map', () => {
    const route = {
      pathFromRoot: [
        { url: [] },
        { url: [new UrlSegment('parking', {})] },
        { url: [new UrlSegment('avp-parking', {})] }
      ],
      queryParams: { foo: 'bar' },
      fragment: 'legend'
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/parking/avp-parking' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state) as UrlTree;

    expect(eventSettingsService.validateEventQueryParams).toHaveBeenCalledWith(route, true);
    expect(router.serializeUrl(result)).toBe('/parking/avp-parking/map?foo=bar#legend');
  });

  it('should redirect configurable events to the builder accommodations route', () => {
    eventSettingsService.hasOptions = true;

    const route = {
      pathFromRoot: [
        { url: [] },
        { url: [new UrlSegment('parking', {})] },
        { url: [new UrlSegment('baseball-parking', {})] }
      ],
      queryParams: {},
      fragment: null
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/parking/baseball-parking' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state) as UrlTree;

    expect(router.serializeUrl(result)).toBe('/parking/baseball-parking/builder/accommodations');
  });

  it('should route configurable events with feature deep links directly to the map', () => {
    eventSettingsService.hasOptions = true;
    eventSettingsService.hasFeatureSelectionQueryParams.mockReturnValue(true);

    const route = {
      pathFromRoot: [
        { url: [] },
        { url: [new UrlSegment('events', {})] },
        { url: [new UrlSegment('gameday-parking', {})] }
      ],
      queryParams: { lot: '43' },
      fragment: null
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/events/gameday-parking' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state) as UrlTree;

    expect(eventSettingsService.hasFeatureSelectionQueryParams).toHaveBeenCalledWith(route.queryParams);
    expect(router.serializeUrl(result)).toBe('/events/gameday-parking/map?lot=43');
  });

  it('should allow direct child routes to load normally', () => {
    const route = {
      pathFromRoot: [
        { url: [] },
        { url: [new UrlSegment('parking', {})] },
        { url: [new UrlSegment('avp-parking', {})] }
      ],
      queryParams: {},
      fragment: null
    } as unknown as ActivatedRouteSnapshot;

    const state = { url: '/parking/avp-parking/map' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);

    expect(result).toBe(true);
  });
});
