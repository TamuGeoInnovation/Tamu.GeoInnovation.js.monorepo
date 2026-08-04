import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';

import { EntryRedirectComponent } from './entry-redirect.component';
import { EventSettingsService } from '../../services/settings/event-settings.service';

describe('EntryRedirectComponent', () => {
  let component: EntryRedirectComponent;
  let router: { navigate: jest.Mock };
  let eventSettingsService: {
    validateEventQueryParams: jest.Mock;
    hasOptions: boolean;
    hasFeatureSelectionQueryParams: jest.Mock;
  };
  let route: ActivatedRoute;

  beforeEach(() => {
    router = {
      navigate: jest.fn()
    };

    eventSettingsService = {
      validateEventQueryParams: jest.fn(),
      hasOptions: false,
      hasFeatureSelectionQueryParams: jest.fn().mockReturnValue(false)
    };

    route = {
      parent: {} as ActivatedRoute,
      snapshot: {
        queryParams: { foo: 'bar' },
        fragment: 'legend'
      } as unknown as ActivatedRouteSnapshot
    } as ActivatedRoute;

    TestBed.configureTestingModule({
      providers: [
        EntryRedirectComponent,
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: EventSettingsService, useValue: eventSettingsService }
      ]
    });

    TestBed.overrideProvider(Router, { useValue: router });
    TestBed.overrideProvider(ActivatedRoute, { useValue: route });
    TestBed.overrideProvider(EventSettingsService, { useValue: eventSettingsService });

    component = TestBed.inject(EntryRedirectComponent);
  });

  it('should route directly to the map when there are no options', () => {
    component.ngOnInit();

    expect(eventSettingsService.validateEventQueryParams).toHaveBeenCalledWith(route.snapshot, true);
    expect(router.navigate).toHaveBeenCalledWith(['map'], {
      relativeTo: route.parent,
      queryParams: route.snapshot.queryParams,
      fragment: 'legend',
      replaceUrl: true
    });
  });

  it('should keep configurable events on the builder accommodations route', () => {
    eventSettingsService.hasOptions = true;

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['builder', 'accommodations'], {
      relativeTo: route.parent,
      queryParams: route.snapshot.queryParams,
      fragment: 'legend',
      replaceUrl: true
    });
  });

  it('should open the map when configurable events include a feature deep link', () => {
    eventSettingsService.hasOptions = true;
    eventSettingsService.hasFeatureSelectionQueryParams.mockReturnValue(true);
    route.snapshot.queryParams = { lot: '43' } as unknown as ActivatedRouteSnapshot['queryParams'];

    component.ngOnInit();

    expect(eventSettingsService.hasFeatureSelectionQueryParams).toHaveBeenCalledWith(route.snapshot.queryParams);
    expect(router.navigate).toHaveBeenCalledWith(['map'], {
      relativeTo: route.parent,
      queryParams: route.snapshot.queryParams,
      fragment: 'legend',
      replaceUrl: true
    });
  });
});
