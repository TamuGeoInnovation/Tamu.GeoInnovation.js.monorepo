import { Component, ChangeDetectionStrategy, input } from '@angular/core';

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
  public readonly columns = input<MapColumnGroup[]>([]);
  public readonly noMapsMessage = input('No maps available.');
  public readonly getApplicationRoute = input<(app: InternalDiscoverApplication) => string[]>(() => []);
}
