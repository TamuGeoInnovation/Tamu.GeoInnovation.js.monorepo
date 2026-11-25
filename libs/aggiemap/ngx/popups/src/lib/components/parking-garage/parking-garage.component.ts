import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { ActivateDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';

/**
 * Details for a parking garage (#1163).
 *
 * Garages used to be rows of the old raster basemap's Garage Parking layer, carrying lot fields (`LotName`, `Name`,
 * `FAC_CODE`), so the building popup they opened before #1163 rendered empty. They are now rows of Campus Structures
 * and carry building fields, so this reads `bldgname` and `bldgabbrev` (#3425).
 *
 * It stays its own component rather than becoming the building popup, for the reason it always had: garages are not
 * in the parking lots layer, so a `?lot=` link cannot find one, and they link through the garage search source
 * instead. It keeps the parking lot popup's layout.
 */
@Component({
  selector: 'tamu-gisc-parking-garage-popup-component',
  templateUrl: '../parking-lot/parking-lot.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [CopyComponent, ActivateDirective]
})
export class ParkingGaragePopupComponent extends BaseDirectionsComponent {
  /**
   * The garage code (`CCG`) where there is one, else its name; the garage search source matches either.
   *
   * `bldgabbrev` carries the same codes the retired layer's `Name` did, so a `?garage=CCG` link made before #3425
   * still resolves. The fields of the retired layer are read as a fallback so that a link or a feature from it,
   * wherever one is still held, keeps working.
   */
  private get garageIdentifier(): string | null {
    const attributes = this.data?.attributes;
    const identifier = [attributes?.bldgabbrev, attributes?.number, attributes?.Name, attributes?.LotName].find(
      (value) => typeof value === 'string' && value.trim().length > 0
    );

    return identifier?.trim() ?? null;
  }

  /** The garage's name, from Campus Structures, falling back to the retired layer's. */
  private get garageName(): string | null {
    const attributes = this.data?.attributes;
    const name = [attributes?.bldgname, attributes?.LotName].find(
      (value) => typeof value === 'string' && value.trim().length > 0
    );

    return name?.trim() ?? null;
  }

  protected override _getShareUrlFragment(): string | null {
    const identifier = this.garageIdentifier;

    return identifier !== null ? this._buildShareUrlFragment('parking-garage', identifier) : null;
  }

  public startDirections() {
    super.startDirections(
      this.garageName ??
        `Garage ${this.garageIdentifier ?? this.data?.attributes?.objectid ?? this.data?.attributes?.OBJECTID}`
    );
  }
}
