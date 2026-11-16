import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { TestingService } from '../services/application-testing.service';
import { developmentOnlyRoute } from './development-only-route.guard';

/** A development-only page goes back up its address where development-only features are off (#2788, #2801). */
describe('developmentOnlyRoute', () => {
  function guard(isTesting: boolean, ...routes: string[][]): { result: unknown; router: Router } {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: TestingService, useValue: { isTesting } }]
    });

    const route = { pathFromRoot: [{ url: [] }, ...routes.map((paths) => ({ url: paths.map((path) => ({ path })) }))] };
    const result = TestBed.runInInjectionContext(() =>
      developmentOnlyRoute(route as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    return { result, router: TestBed.inject(Router) };
  }

  const address = ({ result, router }: { result: unknown; router: Router }) =>
    result instanceof UrlTree ? router.serializeUrl(result) : result;

  it('sends an All Maps section back to All Maps on production', () => {
    expect(address(guard(false, ['all-maps'], ['transportation']))).toBe('/all-maps');
  });

  // `trip/options` is one route with two segments; the page above it is the trip planner, not the map (#2801).
  it('goes back one segment, not one route, when a route has a path of several segments', () => {
    expect(address(guard(false, ['map'], ['d'], ['trip', 'options']))).toBe('/map/d/trip');
  });

  it('opens where development-only features are on', () => {
    expect(guard(true, ['all-maps'], ['transportation']).result).toBe(true);
  });
});
