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

  @ContentChildren(BaseChartComponent, { descendants: true })
  public chartComponents: QueryList<BaseChartComponent>;

  public collection: Observable<esri.Graphic[]>;

  constructor(private collector: FeatureCollectorService) {}

  public ngOnInit() {
    this.collector.init({
      layers: this.layers,
      deleteDuplicates: this.deleteDuplicates,
      identifier: this.identifier
    });

    this.collection = this.collector.collection;
  }

  public ngAfterContentInit() {
    this.chartComponents.forEach((component) => {
      component.data = this.collection;
    });
  }
}
