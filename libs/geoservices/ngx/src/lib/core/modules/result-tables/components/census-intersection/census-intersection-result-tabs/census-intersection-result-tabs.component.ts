import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { ICensusIntersectionRecord } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-census-intersection-result-tabs',
  templateUrl: './census-intersection-result-tabs.component.html',
  styleUrls: ['./census-intersection-result-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CensusIntersectionResultTabsComponent {
  @Input()
  public censusRecords: Array<ICensusIntersectionRecord>;
}
