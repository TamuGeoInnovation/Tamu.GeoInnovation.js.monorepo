import { Component, forwardRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

import { op } from '../../operators/common/common-chart-operators';
import { BaseChartComponent } from '../base/base.component';
import { BarChartConfiguration } from '../chart-container/chart-container.component';

@Component({
  selector: 'tamu-gisc-bar-chart',
  templateUrl: './bar.component.html',
  styleUrls: ['../base/base.component.scss', './bar.component.scss'],
  providers: [{ provide: BaseChartComponent, useExisting: forwardRef(() => BarChartComponent) }]
})
export class BarChartComponent extends BaseChartComponent implements AfterViewInit {
  public test: Subject<any> = new Subject();

  constructor() {
    super();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();

    this.baseConfig = new BarChartConfiguration();

    // Simple test data reducer
    this.chartData = this.source.pipe(
      scan((acc, curr) => {
        // Asserting transformations as an `any` array, otherwise compiler does not like its original
        // union type.
        const p = (<Array<any>>this.transformations)
          .map((transformation, index) => {
            const transformed = {
              value: this.valueForTransformationSet(transformation, curr).value,
              label: this.labels[index]
            };

            return transformed;
          }, [])
          .reduce(
            (datasets, dataset) => {
              return {
                labels: dataset.value.labels,
                datasets: [
                  ...datasets.datasets,
                  {
                    label: dataset.label,
                    data: dataset.value.data
                  }
                ]
              };
            },
            {
              labels: undefined,
              datasets: []
            }
          );

        this.baseConfig.updateData(p);

        return this.baseConfig;
      }, [])
    );

    this.chart.create(this.chartData);
  }

  public valueForTransformationSet(
    set: string | Array<string>,
    collection: Array<any>,
    setDepth?: number,
    setIndex?: number
  ) {
    if (set instanceof Array) {
      return set.reduce(
        (acc, curr, i) => {
          const evaluated = {
            value: this.valueForTransformationSet(curr, acc.value, acc.depth, i),
            depth: acc.depth + 1
          };

          return evaluated;
        },
        {
          depth: 0,
          value: collection
        }
      );
    } else {
      if (op.hasOwnProperty(set)) {
        const params = this.paths[setIndex][setDepth];

        const result = op[set](collection, params);

        return result;
      } else {
        throw new Error('Invalid chart operation.');
      }
    }
  }
}
