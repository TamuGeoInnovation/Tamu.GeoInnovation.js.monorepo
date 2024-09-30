import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-information-popup',
  templateUrl: './move-in-out-information-popup.component.html',
  styleUrls: ['./move-in-out-information-popup.component.scss']
})
export class MoveInOutInformationPopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Information ${this.data.attributes.OBJECTID}`);
  }
}
