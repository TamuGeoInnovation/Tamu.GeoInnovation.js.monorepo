import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck, take } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services//trip-planner.service';
import { TripPlannerModeToggleComponent } from '../../../trip-planner-mode-toggle/containers/base/base.component';
import { TripPlannerTimePickerComponent } from '../../../trip-planner-time-picker/containers/base/base.component';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-trip-planner-mode-picker',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  imports: [TripPlannerModeToggleComponent, TripPlannerTimePickerComponent, RouterLink, AsyncPipe]
})
export class TripPlannerModePickerComponent implements OnInit {
  private plannerService = inject(TripPlannerService);
  private devTools = inject(TestingService);

  public isDev: Observable<boolean>;

  /**
   * Whether accessible routing is offered: only where development-only features are on (#2801), because the routing
   * network does not route accessible trips yet (#2592). Both pickers read this one value, the desktop's Options link
   * and the phone's toggle, so the next change to the rule is made once (#3468: the phone's copy had no gate). Offer it
   * everywhere again once the network routes accessible trips; its page is gated in map.routes.ts too.
   */
  public accessibleRoutingOffered: Observable<boolean>;

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
    this.accessibleRoutingOffered = this.isDev;
  }

  /**
   * Calls the trip planner service and sets accessible travel mode based on the provided value
   */
  public toggleAccessibleTravel() {
    this.plannerService.TravelOptions.pipe(take(1), pluck('accessible')).subscribe((current) => {
      this.plannerService.updateTravelOptions({ accessible: !current });
    });
  }
}
