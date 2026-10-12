import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { getUrlSegmentsFromRouteSnapshot, routeSubstitute } from '@tamu-gisc/common/utils/routing';

@Injectable({
  providedIn: 'root'
})
export class MobileGuard {
  private rp = inject(ResponsiveService);
  private router = inject(Router);

  public canActivate(next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.rp.snapshot.isMobile) {
      const snapshotPath = getUrlSegmentsFromRouteSnapshot(next);
      const pathSegments = routeSubstitute(snapshotPath, 'm', 'd');
      this.router.navigate(pathSegments, { queryParams: next.queryParams });
    }

    return this.rp.snapshot.isMobile;
  }

  public canActivateChild(next: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next);
  }
}
