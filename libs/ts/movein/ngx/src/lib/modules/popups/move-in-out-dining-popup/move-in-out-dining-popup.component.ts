import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-dining-popup',
  templateUrl: './move-in-out-dining-popup.component.html',
  styleUrls: ['./move-in-out-dining-popup.component.scss']
})
export class MoveInOutDiningPopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Dining Area ${this.data.attributes.OBJECTID}`);
  }
}
