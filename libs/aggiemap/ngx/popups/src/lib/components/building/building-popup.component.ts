import { Component, OnInit } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { TitleCasePipe } from '@angular/common';
import { PopupFooterComponent } from '../footer/popup-footer.component';

import { TrimPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-buildling-popup-component',
  templateUrl: './building-popup.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [TitleCasePipe, TrimPipe, PopupFooterComponent]
})
export class BuildingPopupComponent extends BaseDirectionsComponent implements OnInit {
  public ngOnInit() {
    super.ngOnInit();
  }

  protected override _getShareUrlFragment(): string | null {
    // A building's fields are lower case: it comes from `buildingsUrl` (#2707).
    return this._buildShareUrlFragment('building-exact', this.data.attributes.number);
  }

  public startDirections() {
    super.startDirections(
      `${this.data.attributes.number}|${
        this.data.attributes.bldgabbrev ? this.data.attributes.bldgabbrev : this.data.attributes.abbrev
      }`
    );
  }
}
