import { Component, OnInit } from '@angular/core';

import { ParkingCategory } from '@tamu-gisc/ts/events/ngx';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { DiscoveryService } from '../../services/discovery/discovery.service';
import { getApplicationRoute } from '../discover.utils';

interface ParkingCategoryColumn {
  id: ParkingCategory;
  heading: string;
  applications: InternalDiscoverApplication[];
}

/**
 * Parking Maps page. Renders the parking maps grouped into the General / Business / Permit columns
 * from the comp, with placeholder accordion content below.
 */
@Component({
  selector: 'tamu-gisc-aggiemap-parking-maps',
  templateUrl: './parking-maps.component.html',
  styleUrls: ['./parking-maps.component.scss']
})
export class ParkingMapsComponent implements OnInit {
  public columns: ParkingCategoryColumn[] = [];

  public readonly getApplicationRoute = getApplicationRoute;

  constructor(private readonly discoveryService: DiscoveryService) {}

  public ngOnInit(): void {
    const grouped = this.discoveryService.getParkingApplicationsByCategory();

    this.columns = [
      { id: 'general', heading: 'General Parking', applications: grouped.general },
      { id: 'business', heading: 'Business Parking', applications: grouped.business },
      { id: 'permit', heading: 'Permit Parking', applications: grouped.permit }
    ];
  }
}
