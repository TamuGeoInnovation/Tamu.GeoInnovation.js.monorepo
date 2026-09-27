import { Component, Input } from '@angular/core';

import { FEATURED_PARKING_ID } from '../../services/discovery/discovery.service';
import { LastMapService } from '../../services/last-map/last-map.service';

/**
 * Shared header for the Maps sub-pages (Parking Maps, Campus Events, Athletics Events).
 *
 * Renders the breadcrumb trail (`Aggie Map › All Maps › {label}`), a dotted divider, the page
 * title with optional intro text, and the featured "Campus Main Parking" button.
 */
@Component({
  selector: 'tamu-gisc-maps-page-header',
  templateUrl: './maps-page-header.component.html',
  styleUrls: ['./maps-page-header.component.scss']
})
export class MapsPageHeaderComponent {
  /**
   * Page title and the label shown as the active breadcrumb.
   */
  @Input() public title: string;

  /**
   * Optional intro paragraph rendered beneath the title.
   */
  @Input() public intro?: string;

  /**
   * Whether to render the featured Campus Main Parking button. Defaults to `true`.
   */
  @Input() public showMainParking = true;

  constructor(private readonly lastMap: LastMapService) {}

  /**
   * Where the first crumb points: the map the visitor was last looking at rather than always the
   * main campus map. See LastMapService.
   */
  public get lastMapUrl(): string {
    return this.lastMap.url;
  }

  public readonly mainParkingRoute = ['/parking', FEATURED_PARKING_ID];
}
