import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

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
 * Parking Maps page. Renders the parking maps grouped into the General / Business / Permit columns
 * from the comp, with placeholder accordion content below.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-parking-maps',
  templateUrl: './parking-maps.component.html',
  styleUrls: ['./parking-maps.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MapsPageHeaderComponent, MapColumnsComponent, FooterComponent]
})
export class ParkingMapsComponent implements OnInit {
  public columns: MapColumnGroup[] = [];

  public readonly getApplicationRoute = getApplicationRoute;
  private readonly columnDefinitions: MapColumnDefinition[] = [
    { id: 'general', heading: 'General Parking' },
    { id: 'business', heading: 'Business Parking' },
    { id: 'permit', heading: 'Permit Parking' }
  ];

  constructor(private readonly discoveryService: DiscoveryService) {}

  public ngOnInit(): void {
    const applications = sortApplicationsByName(
      this.discoveryService
        .getVisibleInternalDiscoverApplications()
        .filter((app) => app.mapTypes.includes('parking') && app.id !== 'ts-main-parking')
    );

    this.columns = buildMapColumnGroups(applications, this.columnDefinitions, (app) => app.columnKey ?? app.parkingCategory);
  }
}
