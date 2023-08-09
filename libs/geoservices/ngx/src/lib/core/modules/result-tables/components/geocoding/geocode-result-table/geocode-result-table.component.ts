import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

import { EnumeratorKeyValuePairs } from '@tamu-gisc/common/utils/object';
import { IGeocodeRecord } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-geocode-result-table',
  templateUrl: './geocode-result-table.component.html',
  styleUrls: ['./geocode-result-table.component.scss']
})
export class GeocodeResultTableComponent {
  @Input()
  public geocode: IGeocodeRecord;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  private _defaultOrder = [];
}
