import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { getUrlSegmentsFromRouteSnapshot, routeSubstitute } from '@tamu-gisc/common/utils/routing';

@Injectable({
  providedIn: 'root'
})
export class DesktopGuard  {
  constructor(private rp: ResponsiveService, private router: Router) {}

  public canActivate(next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.rp.snapshot.isMobile) {
      const snapshotPath = getUrlSegmentsFromRouteSnapshot(next);
      const pathSegments = routeSubstitute(snapshotPath, 'd', 'm');
      this.router.navigate(pathSegments, { queryParams: next.queryParams });
    }

    return !this.rp.snapshot.isMobile;
  }

  public canActivateChild(next): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next);
  }
}
