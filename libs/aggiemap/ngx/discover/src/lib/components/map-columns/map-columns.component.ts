import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { InternalDiscoverApplication } from '../../interfaces/discover-application.interface';
import { MapColumnGroup } from '../discover.utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-aggiemap-map-columns',
  templateUrl: './map-columns.component.html',
  styleUrls: ['./map-columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class MapColumnsComponent {
  @Input() public columns: MapColumnGroup[] = [];
  @Input() public noMapsMessage = 'No maps available.';
  @Input() public getApplicationRoute: (app: InternalDiscoverApplication) => string[] = () => [];
}
