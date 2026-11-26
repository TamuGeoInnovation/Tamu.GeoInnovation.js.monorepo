import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { PopupFooterComponent } from '../footer/popup-footer.component';

@Component({
  selector: 'tamu-gisc-lactation-popup-component',
  templateUrl: './lactation.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [PopupFooterComponent]
})
export class LactationPopupComponent extends BaseDirectionsComponent {
  // The room's building, which is also what the trip planner names the stop (`bldgname`).
  public override startDirections() {
    super.startDirections(`Lactation room ${this.data.attributes.bldgname}`);
  }
}
