import { Component, ChangeDetectionStrategy } from '@angular/core';

import { TripPlannerOptionsBaseComponent } from '../base/base.component';

import { AsyncPipe } from '@angular/common';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-trip-planner-biking-options',
  templateUrl: './trip-planner-biking-options.component.html',
  styleUrls: ['../../containers/base/base.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CheckboxComponent, AsyncPipe]
})
export class TripPlannerBikingOptionsComponent extends TripPlannerOptionsBaseComponent {}
