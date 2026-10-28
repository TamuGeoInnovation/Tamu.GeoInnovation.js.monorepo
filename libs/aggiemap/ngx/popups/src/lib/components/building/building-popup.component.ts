import { Component, OnInit } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { ActivateDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';

import { TrimPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-buildling-popup-component',
  templateUrl: './building-popup.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [CopyComponent, AsyncPipe, TitleCasePipe, TrimPipe, ActivateDirective]
})
export class BuildingPopupComponent extends BaseDirectionsComponent implements OnInit {
  public ngOnInit() {
    super.ngOnInit();
  }

  protected override _getShareUrlFragment(): string | null {
    return this._buildShareUrlFragment('building-exact', this.data.attributes.Number);
  }

  public startDirections() {
    super.startDirections(
      `${this.data.attributes.Number}|${
        this.data.attributes.BldgAbbr ? this.data.attributes.BldgAbbr : this.data.attributes.Abbrev
      }`
    );
  }
}
