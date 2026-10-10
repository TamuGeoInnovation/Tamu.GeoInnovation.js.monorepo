import { Component, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerDirectionsActionsComponent } from '../base/base.component';

import { AsyncPipe } from '@angular/common';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-trip-planner-directions-actions-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['../base/base.component.scss', './mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ClipboardCopyDirective, AsyncPipe]
})
export class TripPlannerDirectionsActionsMobileComponent extends TripPlannerDirectionsActionsComponent {
  private ccd: ChangeDetectorRef;
  private anl: Angulartics2;
  private rt: Router;
  private ar: ActivatedRoute;
  private ps: TripPlannerService;

  constructor() {
    const ccd = inject(ChangeDetectorRef);
    const anl = inject(Angulartics2);
    const rt = inject(Router);
    const ar = inject(ActivatedRoute);
    const ps = inject(TripPlannerService);

    super(ccd, anl, rt, ar, ps);
  
    this.ccd = ccd;
    this.anl = anl;
    this.rt = rt;
    this.ar = ar;
    this.ps = ps;
  }
}
