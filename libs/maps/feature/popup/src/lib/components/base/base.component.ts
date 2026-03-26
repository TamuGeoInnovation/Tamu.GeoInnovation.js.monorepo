import { Component } from '@angular/core';


@Component({
  selector: 'tamu-gisc-base-popup-component',
  templateUrl: './base.component.html',
  styleUrls: ['../../containers/base/base.component.scss']
})
export class BasePopupComponent {
  /**
   * Data set by the parent popup component.
   *
   */
  public data: __esri.Graphic;
}
