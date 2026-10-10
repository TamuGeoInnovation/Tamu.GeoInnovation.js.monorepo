import { Component, ChangeDetectionStrategy } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-accessible-popup-component',
  templateUrl: './accessible.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AccessiblePopupComponent extends BaseDirectionsComponent {}
