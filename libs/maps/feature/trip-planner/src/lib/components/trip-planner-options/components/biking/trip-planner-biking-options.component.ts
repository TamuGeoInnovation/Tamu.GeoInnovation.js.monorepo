import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerOptionsBaseComponent } from '../base/base.component';
import { TripPlannerService } from '../../../../services/trip-planner.service';

import { AsyncPipe } from '@angular/common';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-trip-planner-biking-options',
  templateUrl: './trip-planner-biking-options.component.html',
  styleUrls: ['../../containers/base/base.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CheckboxComponent, AsyncPipe]
})
export class TripPlannerBikingOptionsComponent extends TripPlannerOptionsBaseComponent {
  constructor(
    private analytics: Angulartics2,
    private tp: TripPlannerService,
    private dts: TestingService
  ) {
    super(analytics, tp, dts);
  }
}
