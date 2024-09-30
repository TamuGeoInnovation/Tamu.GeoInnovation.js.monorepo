import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-recycle-popup',
  templateUrl: './move-in-out-recycle-popup.component.html',
  styleUrls: ['./move-in-out-recycle-popup.component.scss']
})
export class MoveInOutRecyclePopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Information ${this.data.attributes.OBJECTID}`);
  }
}
