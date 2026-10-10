import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-lactation-popup-component',
  templateUrl: './lactation.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class LactationPopupComponent extends BaseDirectionsComponent {}
