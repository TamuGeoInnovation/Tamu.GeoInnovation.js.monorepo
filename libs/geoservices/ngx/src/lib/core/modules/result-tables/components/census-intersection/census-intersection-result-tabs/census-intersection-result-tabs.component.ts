import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { ICensusIntersectionRecord } from '@tamu-gisc/geoprocessing-v5';
import { TabsComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { TabComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { CensusIntersectionResultTableComponent } from '../census-intersection-result-table/census-intersection-result-table.component';

@Component({
  selector: 'tamu-gisc-census-intersection-result-tabs',
  templateUrl: './census-intersection-result-tabs.component.html',
  styleUrls: ['./census-intersection-result-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TabsComponent, TabComponent, CensusIntersectionResultTableComponent]
})
export class CensusIntersectionResultTabsComponent {
  @Input()
  public censusRecords: Array<ICensusIntersectionRecord>;
}
