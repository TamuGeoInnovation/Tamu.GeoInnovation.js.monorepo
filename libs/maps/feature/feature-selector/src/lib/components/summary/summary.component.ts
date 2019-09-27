import { Component, OnInit, Input } from '@angular/core';

import { FeatureCollectorService } from '../../services/collector.service';
import { Observable } from 'rxjs';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-slection-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [FeatureCollectorService]
})
export class SelectionSummaryComponent implements OnInit {
  @Input()
  public layers: string | string[];

  @Input()
  public deleteDuplicates: boolean;

  @Input()
  public identifier: string;

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
}
