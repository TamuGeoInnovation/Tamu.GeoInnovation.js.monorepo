import { Component, Input } from '@angular/core';

import { ICensusIntersection } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-census-intersection-result-tabs',
  templateUrl: './census-intersection-result-tabs.component.html',
  styleUrls: ['./census-intersection-result-tabs.component.scss']
})
export class CensusIntersectionResultTabsComponent {
  @Input()
  public censusRecords: Array<ICensusIntersection>;
}
