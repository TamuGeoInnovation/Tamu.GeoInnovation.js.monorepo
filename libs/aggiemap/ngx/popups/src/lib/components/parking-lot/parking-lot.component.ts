import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { AsyncPipe } from '@angular/common';
import { ActivateDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';

@Component({
  selector: 'tamu-gisc-parking-lot-popup-component',
  templateUrl: './parking-lot.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [CopyComponent, AsyncPipe, ActivateDirective]
})
export class ParkingLotPopupComponent extends BaseDirectionsComponent {
  private get lotIdentifier(): string | number | null {
    // A lot's fields are lower case: it comes from `surfaceLotsUrl` (#2722).
    const identifiers = [this.data?.attributes?.lotname, this.data?.attributes?.name];

    const identifier = identifiers.find((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return value !== null && value !== undefined;
    });

    return identifier ?? null;
  }

  protected override _getShareUrlFragment(): string | null {
    const identifier = this.lotIdentifier;

    return identifier !== null ? this._buildShareUrlFragment('parking-lot', identifier) : null;
  }

  public startDirections() {
    super.startDirections(`Lot ${this.lotIdentifier ?? this.data.attributes.objectid}`);
  }
}
