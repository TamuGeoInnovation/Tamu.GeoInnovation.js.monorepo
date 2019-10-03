import { Component, OnInit, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseChartComponent } from '@tamu-gisc/charts';

import { FeatureCollectorService } from '../../services/collector.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-slection-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [FeatureCollectorService]
})
export class SelectionSummaryComponent implements OnInit, AfterContentInit {
  @Input()
  public layers: string | string[];

  @Input()
  public deleteDuplicates: boolean;

  @Input()
  public identifier: string;

  public collection: Observable<esri.Graphic[]>;

  /**
   * Query for a list of BaseChartComponent subclasses such as LineChartComponent, BarChartCompoonent,
   * etc, that all extend from the BaseChartComponent. Collector collection will be injected as their
   * data source instead of template property binding.
   */
  @ContentChildren(BaseChartComponent, { descendants: true })
  public chartComponents: QueryList<BaseChartComponent>;

  constructor(private collector: FeatureCollectorService) {}

  /**
   * Set up the SelectionSummaryComponent feature collector.
   */
  public ngOnInit() {
    this.collector.init({
      layers: this.layers,
      deleteDuplicates: this.deleteDuplicates,
      identifier: this.identifier
    });

    this.collection = this.collector.collection;
  }

  /**
   * Content children are available at this lifecycle hook. Inject data source.
   */
  public ngAfterContentInit() {
    this.chartComponents.forEach((component) => {
      component.source = this.collection;
    });
  }
}
