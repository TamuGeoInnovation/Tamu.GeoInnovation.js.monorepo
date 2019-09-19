import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getPathFromRouteSnapshot } from '@tamu-gisc/common/utils/routing';

@Component({
  selector: 'app-mobile-sidebar',
  templateUrl: './mobile-sidebar.component.html',
  styleUrls: ['./mobile-sidebar.component.scss']
})
export class MobileSidebarComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  /**
   * Returns to the parent route, effectively closing the sidebar.
   *
   * @memberof MobileSidebarComponent
   */
  public close() {
    // Get the parent route.
    const parent = getPathFromRouteSnapshot(this.route.snapshot).slice(0, -1);

    // Absolute nagivation to the parent.
    this.router.navigate(parent);
  }
}
