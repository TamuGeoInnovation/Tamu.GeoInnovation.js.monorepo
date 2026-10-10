import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from '@angular/router';
import { getUrlSegmentsFromRouteSnapshot } from '@tamu-gisc/common/utils/routing';

import { BackdropComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

@Component({
  selector: 'tamu-gisc-mobile-sidebar',
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, BackdropComponent]
})
export class MobileSidebarComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  /**
   * Returns to the parent route, effectively closing the sidebar.
   */
  public close() {
    // Get the parent route.
    const parent = getUrlSegmentsFromRouteSnapshot(this.route.snapshot).slice(0, -1);

    // Absolute navigation to the parent.
    this.router.navigate(parent);
  }
}
