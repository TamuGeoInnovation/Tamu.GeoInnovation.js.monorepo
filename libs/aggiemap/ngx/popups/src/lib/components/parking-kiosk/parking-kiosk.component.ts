import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { PopupFooterComponent } from '../footer/popup-footer.component';

@Component({
  selector: 'tamu-gisc-parking-kiosk-popup-component',
  templateUrl: './parking-kiosk.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [PopupFooterComponent]
})
export class ParkingKioskPopupComponent extends BaseDirectionsComponent {
  public startDirections() {
    super.startDirections(`ObjectID ${this.data.attributes.OBJECTID}`);
  }
}
