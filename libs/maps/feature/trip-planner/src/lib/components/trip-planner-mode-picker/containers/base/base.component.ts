import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck, take } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services//trip-planner.service';

@Component({
  selector: 'tamu-gisc-trip-planner-mode-picker',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class TripPlannerModePickerComponent implements OnInit {
  public isDev: Observable<boolean>;

  constructor(private plannerService: TripPlannerService, private devTools: TestingService) {}

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
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
