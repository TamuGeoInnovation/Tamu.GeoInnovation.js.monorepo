import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-accessible-parking-popup',
  templateUrl: './move-in-out-accessible-parking-popup.component.html',
  styleUrls: ['./move-in-out-accessible-parking-popup.component.scss']
})
export class MoveInOutAccessibleParkingPopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Accessible Parking ${this.data.attributes.OBJECTID}`);
  }
}
