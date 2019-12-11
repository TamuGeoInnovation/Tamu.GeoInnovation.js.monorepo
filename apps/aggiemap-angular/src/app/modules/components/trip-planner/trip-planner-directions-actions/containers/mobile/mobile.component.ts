import { Component, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { TripPlannerService } from '../../../../../services/trip-planner/trip-planner.service';
import { TripPlannerDirectionsActions } from '../base/base.component';

@Component({
  selector: 'trip-planner-directions-actions-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss']
})
export class TripPlannerDirectionsActionsMobile extends TripPlannerDirectionsActions {
  constructor(
    private ccd: ChangeDetectorRef,
    private anl: Angulartics2,
    private rt: Router,
    private ar: ActivatedRoute,
    private ps: TripPlannerService
  ) {
    super(ccd, anl, rt, ar, ps);
  }
}
