import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-bus-stop-popup',
  templateUrl: './move-in-out-bus-stop-popup.component.html',
  styleUrls: ['./move-in-out-bus-stop-popup.component.scss']
})
export class MoveInOutBusStopPopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Move Shuttle Stop ${this.data.attributes.OBJECTID}`);
  }
}

