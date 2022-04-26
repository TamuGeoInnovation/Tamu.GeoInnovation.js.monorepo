import { Component } from '@angular/core';
import { Angulartics2 } from 'angulartics2';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TripPlannerOptionsBaseComponent } from '../base/base.component';
import { TripPlannerService } from '../../../../services/trip-planner.service';

@Component({
  selector: 'tamu-gisc-trip-planner-biking-options',
  templateUrl: './trip-planner-biking-options.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class TripPlannerBikingOptionsComponent extends TripPlannerOptionsBaseComponent {
  constructor(private analytics: Angulartics2, private tp: TripPlannerService, private dts: TestingService) {
    super(analytics, tp, dts);
  }
}
