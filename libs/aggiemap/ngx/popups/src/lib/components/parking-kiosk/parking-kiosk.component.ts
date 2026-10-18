import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-parking-kiosk-popup-component',
  templateUrl: './parking-kiosk.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class ParkingKioskPopupComponent extends BaseDirectionsComponent {
  public startDirections() {
    super.startDirections(`ObjectID ${this.data.attributes.OBJECTID}`);
  }
}
