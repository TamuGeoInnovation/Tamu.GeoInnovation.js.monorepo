import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { PopupFooterComponent } from '../footer/popup-footer.component';

@Component({
  selector: 'tamu-gisc-restroom-popup-component',
  templateUrl: './restroom.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [PopupFooterComponent]
})
export class RestroomPopupComponent extends BaseDirectionsComponent {
  public override startDirections() {
    super.startDirections(`Restroom ${this.data.attributes.Name}`);
  }
}
