import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TripPlannerModeToggleComponent, TripPlannerTimePickerComponent, RouterLink, AsyncPipe]
})
export class TripPlannerModePickerComponent implements OnInit {
  public isDev: Observable<boolean>;

  constructor(
    private plannerService: TripPlannerService,
    private devTools: TestingService
  ) {}

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
