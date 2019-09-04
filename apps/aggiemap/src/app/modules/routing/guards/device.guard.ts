import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { getPathFromRouteSnapshot, routeSubstitute } from '@tamu-gisc/common/utils/routing';

@Injectable({
  providedIn: 'root'
})
export class MobileGuard implements CanActivate, CanActivateChild {
  constructor(private rp: ResponsiveService, private router: Router) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.rp.snapshot.isMobile) {
      const snapshotPath = getPathFromRouteSnapshot(next);
      const pathSegments = routeSubstitute(snapshotPath, 'm', 'd');
      this.router.navigate(pathSegments, { queryParams: next.queryParams });
    }

    return this.rp.snapshot.isMobile;
  }

  public canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}

@Injectable({
  providedIn: 'root'
})
export class DesktopGuard implements CanActivate, CanActivateChild {
  constructor(private rp: ResponsiveService, private router: Router) {}

  public canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.rp.snapshot.isMobile) {
      const snapshotPath = getPathFromRouteSnapshot(next);
      const pathSegments = routeSubstitute(snapshotPath, 'd', 'm');
      this.router.navigate(pathSegments, { queryParams: next.queryParams });
    }

    return !this.rp.snapshot.isMobile;
  }

  public canActivateChild(next, state): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
