import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { PopupFooterComponent } from '../footer/popup-footer.component';

@Component({
  selector: 'tamu-gisc-accessible-popup-component',
  templateUrl: './accessible.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [PopupFooterComponent]
})
export class AccessiblePopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Accessible entrance ${this.data.attributes.BldgAbbrev ?? this.data.attributes.BldgNumber}`);
  }
}
