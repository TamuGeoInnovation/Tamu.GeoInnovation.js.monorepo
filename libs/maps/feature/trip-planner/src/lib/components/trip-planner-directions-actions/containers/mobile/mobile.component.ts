import { Component, ChangeDetectionStrategy } from '@angular/core';

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
export class TripPlannerDirectionsActionsMobileComponent extends TripPlannerDirectionsActionsComponent {}
