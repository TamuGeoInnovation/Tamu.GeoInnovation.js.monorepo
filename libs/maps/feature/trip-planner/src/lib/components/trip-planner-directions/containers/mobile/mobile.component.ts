import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { TripPlannerDirectionsComponent } from '../base/base.component';
import { TripPlannerService } from '../../../../services/trip-planner.service';

@Component({
  selector: 'tamu-gisc-trip-planner-directions-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss']
})
export class TripPlannerDirectionsMobileComponent extends TripPlannerDirectionsComponent {
  constructor(private rt: Router, private ps: TripPlannerService, private al: Angulartics2) {
    super(rt, ps, al);
  }
}
