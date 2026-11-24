import { Component, OnInit, inject } from '@angular/core';

import { DiscoveryService } from '../../services/discovery/discovery.service';
import {
  buildMapColumnGroups,
  getApplicationRoute,
  MapColumnDefinition,
  MapColumnGroup,
  sortApplicationsByName
} from '../discover.utils';
import { MapsPageHeaderComponent } from '../maps-page-header/maps-page-header.component';
import { MapColumnsComponent } from '../map-columns/map-columns.component';

import { FooterComponent } from '@tamu-gisc/aggiemap/ngx/ui/shared';

/**
 * The Parking & Transportation page.
 *
 * Two sections since #2895: the transportation maps first, then the parking maps in the General /
 * Business / Permit columns from the comp. Transportation had its own All Maps tile and page until
 * then; one section listing both was the maintainer's decision of 13 November 2026, because a third
 * top-level tile for three maps read as more than it was.
 *
 * The two sections are built from `mapTypes`, not from `type`: a map's `type` is still `parking`
 * where it always was, and `mapTypes` is what decides where it is listed - and, through
 * `mapSegment()`, what its address is. So the maps in the top section are at `/transportation/<id>`
 * and the ones below at `/parking/<id>`, from one page, with no special-casing here (#2767).
 */
@Component({
  selector: 'tamu-gisc-aggiemap-parking-maps',
  templateUrl: './parking-maps.component.html',
  styleUrls: ['./parking-maps.component.scss'],
  imports: [MapsPageHeaderComponent, MapColumnsComponent, FooterComponent]
})
export class ParkingMapsComponent implements OnInit {
  private readonly discoveryService = inject(DiscoveryService);

  /** The transportation maps: Bus Routes, Micromobility and Sustainable Transportation. */
  public transportationColumns: MapColumnGroup[] = [];

  public columns: MapColumnGroup[] = [];

  public readonly getApplicationRoute = getApplicationRoute;
  private readonly columnDefinitions: MapColumnDefinition[] = [
    { id: 'general', heading: 'General Parking' },
    { id: 'business', heading: 'Business Parking' },
    { id: 'permit', heading: 'Permit Parking' }
  ];

  public ngOnInit(): void {
    const applications = this.discoveryService.getVisibleInternalDiscoverApplications();

    this.transportationColumns = buildMapColumnGroups(
      sortApplicationsByName(applications.filter((app) => app.mapTypes.includes('transportation')))
    );

    this.columns = buildMapColumnGroups(
      sortApplicationsByName(
        applications.filter((app) => app.mapTypes.includes('parking') && app.id !== 'ts-main-parking')
      ),
      this.columnDefinitions,
      (app) => app.columnKey ?? app.parkingCategory
    );
  }
}
