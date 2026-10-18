import { Component, OnInit, AfterContentInit, ChangeDetectionStrategy, inject, input, model, contentChildren } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseChartComponent } from '@tamu-gisc/ui-kits/ngx/charts';

import { FeatureCollectorService } from '../../services/collector.service';
import { AsyncPipe } from '@angular/common';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-selection-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  providers: [FeatureCollectorService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe]
})
export class SelectionSummaryComponent implements OnInit, AfterContentInit {
  private collector = inject(FeatureCollectorService);

  public readonly selfCollect = input<boolean>(undefined);

  public readonly layers = input<string | string[]>(undefined);

  public readonly deleteDuplicates = input<boolean>(undefined);

  public readonly identifier = input<string>(undefined);

  // A model rather than an input: the component collects its own when `selfCollect` is set.
  public readonly collection = model<Observable<esri.Graphic[]>>(undefined);

  /**
   * Query for a list of BaseChartComponent subclasses such as LineChartComponent, BarChartComponent,
   * etc, that all extend from the BaseChartComponent. Collector collection will be injected as their
   * data source instead of template property binding.
   */
  public readonly chartComponents = contentChildren(BaseChartComponent, { descendants: true });

  /**
   * Set up the SelectionSummaryComponent feature collector.
   */
  public ngOnInit() {
    if (this.selfCollect() === true) {
      this.collector.init({
        layers: this.layers(),
        deleteDuplicates: this.deleteDuplicates(),
        identifier: this.identifier()
      });

      this.collection.set(this.collector.collection);
    }
  }

  /**
   * Content children are available at this lifecycle hook. Inject data source.
   */
  public ngAfterContentInit() {
    this.chartComponents().forEach((component) => {
      component.source.set(this.collection());
    });
  }
}
