import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { TripPlannerDirectionsComponent } from '../base/base.component';
import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerDirectionsActionsMobileComponent } from '../../../trip-planner-directions-actions/containers/mobile/mobile.component';
import { TripPlannerModeSwitchComponent } from '../../../trip-planner-mode-switch/containers/base/base.component';

@Component({
  selector: 'tamu-gisc-trip-planner-directions-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TripPlannerDirectionsActionsMobileComponent, TripPlannerModeSwitchComponent]
})
export class TripPlannerDirectionsMobileComponent extends TripPlannerDirectionsComponent {
  private rt: Router;
  private ps: TripPlannerService;
  private al: Angulartics2;

  constructor() {
    const rt = inject(Router);
    const ps = inject(TripPlannerService);
    const al = inject(Angulartics2);

    super(rt, ps, al);
  
    this.rt = rt;
    this.ps = ps;
    this.al = al;
  }
}
