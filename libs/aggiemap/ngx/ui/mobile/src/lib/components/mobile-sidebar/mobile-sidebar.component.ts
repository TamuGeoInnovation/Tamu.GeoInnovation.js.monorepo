import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getUrlSegmentsFromRouteSnapshot } from '@tamu-gisc/common/utils/routing';

@Component({
  selector: 'tamu-gisc-mobile-sidebar',
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.scss']
})
export class MobileSidebarComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

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
