import { Component, ChangeDetectionStrategy } from '@angular/core';
import { KeyValuePipe } from '@angular/common';

import esri = __esri;

@Component({
    selector: 'tamu-gisc-base-popup-component',
    templateUrl: './base.popup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [KeyValuePipe]
})
export class BasePopupComponent {
  /**
   * Data set by the parent popup component.
   */
  public data: esri.Graphic;
}
