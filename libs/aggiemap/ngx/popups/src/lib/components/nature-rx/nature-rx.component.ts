import { Component, OnInit } from '@angular/core';

import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { PhotoCarouselComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AsyncPipe } from '@angular/common';
import { ActivateDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';
import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { carouselImageUrls } from '../../carousel-images';

/**
 * The amenities a Nature Rx space can have, in the order they are listed.
 *
 * The service holds sixteen of these as `Yes`/`No` strings. Only the ones a space *has* are shown, which
 * is the maintainer's decision (#2630): a list of what is there reads as information, and the same list
 * padded with everything that is not reads as a form.
 *
 * The labels are the service's own field aliases, so renaming one there renames it here.
 */
export const NATURE_RX_AMENITIES: ReadonlyArray<{ field: string; label: string }> = [
  { field: 'restrooms', label: 'Restrooms' },
  { field: 'seating', label: 'Seating' },
  { field: 'tables', label: 'Table space' },
  { field: 'shade', label: 'Shade' },
  { field: 'shelters', label: 'Shelters' },
  { field: 'pavilions', label: 'Pavilions' },
  { field: 'picnic', label: 'Picnic' },
  { field: 'hammocks', label: 'Hammocks' },
  { field: 'ponds', label: 'Ponds' },
  { field: 'turf', label: 'Turf' },
  { field: 'open_play_area', label: 'Open play area' },
  { field: 'sports', label: 'Sports use' },
  { field: 'nature_trail', label: 'Nature trail' },
  { field: 'walk_jog_path', label: 'Walking or jogging path' },
  { field: 'bike_racks', label: 'Bike racks' },
  { field: 'memorial', label: 'Memorial area, limited hours' }
];

/**
 * Whether a space has an amenity.
 *
 * The field is a string rather than a flag, so it is compared case-insensitively and trimmed: the service
 * is edited by hand and `Yes`, `yes` and `Yes ` all mean the same thing. Anything else - `No`, an empty
 * field, a field the service has stopped publishing - means it is not shown.
 */
export function hasAmenity(value: unknown): boolean {
  return typeof value === 'string' && value.trim().toLowerCase() === 'yes';
}

/** The amenities a space has, as labels, in `NATURE_RX_AMENITIES` order. */
export function amenitiesOf(attributes: Record<string, unknown> | undefined): Array<string> {
  if (!attributes) {
    return [];
  }

  return NATURE_RX_AMENITIES.filter((amenity) => hasAmenity(attributes[amenity.field])).map(
    (amenity) => amenity.label
  );
}

@Component({
  selector: 'tamu-gisc-nature-rx-popup-component',
  templateUrl: './nature-rx.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [CopyComponent, PhotoCarouselComponent, AsyncPipe, MarkdownParsePipe, ActivateDirective]
})
export class NatureRxPopupComponent extends BaseDirectionsComponent implements OnInit {
  public medias: Array<string> = [];
  public amenities: Array<string> = [];

  public ngOnInit(): void {
    super.ngOnInit();

    this.medias = carouselImageUrls(this.data?.attributes?.images);
    this.amenities = amenitiesOf(this.data?.attributes);
  }

  protected override _getShareUrlFragment(): string | null {
    return this._buildShareUrlFragment('nature-rx-exact', this.data.attributes.objectid);
  }

  public startDirections() {
    super.startDirections(`${this.data.attributes.area_name}`);
  }
}
