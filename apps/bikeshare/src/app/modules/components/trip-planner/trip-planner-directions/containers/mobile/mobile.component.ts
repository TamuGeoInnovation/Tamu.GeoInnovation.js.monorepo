import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';

import { TripPlannerDirectionsComponent } from '../base/base.component';

import { Angulartics2 } from 'angulartics2';

@Component({
  selector: 'trip-planner-directions-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss']
})
export class TripPlannerDirectionsMobileComponent extends TripPlannerDirectionsComponent {
  constructor(private rt: Router, private ps: TripPlannerService, private al: Angulartics2) {
    super(rt, ps, al);
  }
}
