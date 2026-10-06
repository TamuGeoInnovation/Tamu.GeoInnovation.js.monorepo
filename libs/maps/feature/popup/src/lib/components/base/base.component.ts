import { Component, ChangeDetectionStrategy } from '@angular/core';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-base-popup-component',
  templateUrl: './base.component.html',
  styleUrls: ['../../containers/base/base.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BasePopupComponent {
  /**
   * Data set by the parent popup component.
   *
   */
  public data: esri.Graphic;
}
