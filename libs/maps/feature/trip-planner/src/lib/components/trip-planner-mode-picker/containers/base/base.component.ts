import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, pluck, shareReplay, take } from 'rxjs/operators';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerService } from '../../../../services//trip-planner.service';
import { TripPlannerModeToggleComponent } from '../../../trip-planner-mode-toggle/containers/base/base.component';
import { TripPlannerTimePickerComponent } from '../../../trip-planner-time-picker/containers/base/base.component';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-trip-planner-mode-picker',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  imports: [TripPlannerModeToggleComponent, TripPlannerTimePickerComponent, RouterLink, AsyncPipe, CheckboxComponent]
})
export class TripPlannerModePickerComponent implements OnInit {
  private plannerService = inject(TripPlannerService);
  private devTools = inject(TestingService);

  public isDev: Observable<boolean> = this.devTools.get('isTesting');

  /** Whether the trip is a walk, the only mode shade applies to (shade-aware walking prototype). */
  public readonly isWalking: Observable<boolean> = this.plannerService.TravelOptions.pipe(
    pluck('travel_mode'),
    map((mode) => this.plannerService.getRuleForModes([mode]) === this.plannerService.rule_walk),
    shareReplay(1)
  );

  /** Whether walks prefer shade. */
  public readonly shade: Observable<boolean> = this.plannerService.TravelOptions.pipe(
    pluck('shade'),
    map((shade) => shade === true),
    shareReplay(1)
  );

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
  }

  public setShade(shade: boolean) {
    this.plannerService.updateTravelOptions({ shade: shade === true });
  }

  public toggleShade() {
    this.shade.pipe(take(1)).subscribe((current) => this.setShade(!current));
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
