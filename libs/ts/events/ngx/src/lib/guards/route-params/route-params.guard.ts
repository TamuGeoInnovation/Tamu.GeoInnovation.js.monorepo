import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Params,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

import { EventSettingsService } from '../../services/settings/event-settings.service';

@Injectable({
  providedIn: 'root'
})
export class RouteParamsGuard implements CanActivate, CanLoad, CanActivateChild {
  constructor(
    private readonly ar: ActivatedRoute,
    private readonly es: EventSettingsService,
    private readonly router: Router
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Test to make sure the the application URL includes the eventId parameter

    console.log('canActivate', route);

    return this._performChecks(route);
  }

  public canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Test to make sure the the application URL includes the eventId parameter

    console.log('canLoad', route, segments);
    return this._performChecks(this.ar.snapshot);
  }
  public canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Test to make sure the the application URL includes the eventId parameter
    console.log('canActivateChild', childRoute, state);

    return this._performChecks(childRoute);
  }

  private _routeHasParams(params: Params): boolean {
    if (params['eventId']) {
      return true;
    } else {
      // If the eventId parameter is not present, redirect to the map page
      return false;
    }
  }

  private _routeHasValidEvent(id: string): boolean {
    // Implement your logic to check if the event ID is valid
    return this.es.validateEventId(id);
  }

  private _performChecks(ps: ActivatedRouteSnapshot): boolean | UrlTree {
    const paramKey = 'eventId';
    const params = ps.params;
    const paramsId = params[paramKey];

    if (this._routeHasParams(params)) {
      if (this._routeHasValidEvent(paramsId)) {
        return true;
      }
    }

    // It's possible that as the application makes its way through the route tree, it will run into
    // a general catch-all with redirectTo that strips the eventId parameter.
    // If this is the case, we need to find the nearest parent with the eventId parameter.
    const nearestParentWithParams = this._findNearestParentWithParams(ps);

    if (nearestParentWithParams) {
      // Build URL tree from activate route snapshot `pathFromRoot` up until this activated route.
      // The full path will include this route's path.
      const pathFromRoot = nearestParentWithParams.pathFromRoot
        .map((r) => r.url)
        .filter((p) => p && p.length > 0)
        .join('/');

      const tree: UrlTree = this.router.parseUrl(`/${pathFromRoot}/${ps.routeConfig?.path || ''}`);

      console.log('RouteParamsGuard: Redirecting to nearest parent with params', tree);

      return tree;
    }

    return false;
  }

  private _findNearestParentWithParams(ps: ActivatedRouteSnapshot): ActivatedRouteSnapshot | null {
    if (this._routeHasParams(ps.params)) {
      return ps;
    } else if (ps.parent) {
      return this._findNearestParentWithParams(ps.parent);
    } else {
      return null;
    }
  }
}
