import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-restroom-popup-component',
  templateUrl: './restroom.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class RestroomPopupComponent extends BaseDirectionsComponent {}
