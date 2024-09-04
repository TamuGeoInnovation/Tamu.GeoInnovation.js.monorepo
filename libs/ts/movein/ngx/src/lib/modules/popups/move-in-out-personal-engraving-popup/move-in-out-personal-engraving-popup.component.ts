import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-personal-engraving-popup',
  templateUrl: './move-in-out-personal-engraving-popup.component.html',
  styleUrls: ['./move-in-out-personal-engraving-popup.component.scss']
})
export class MoveInOutPersonalEngravingPopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Engraving Location ${this.data.attributes.OBJECTID}`);
  }
}
