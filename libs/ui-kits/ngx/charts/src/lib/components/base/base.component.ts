import { Component, ViewChild, Input, AfterViewInit, OnInit } from '@angular/core';
import { Observable, iif, of } from 'rxjs';
import { scan } from 'rxjs/operators';

import { op } from '../../operators/common/common-chart-operators';
import {
  ChartContainerComponent,
  ChartConfiguration,
  IChartConfiguration
} from '../chart-container/chart-container.component';

@Component({
  template: '',
  styleUrls: ['base.component.scss']
})
export class BaseChartComponent implements OnInit, AfterViewInit {
  /**
   * A collection of items (esri graphics or otherwise) used in processing to generate the `ChartConfig` data sets.
   */
  @Input()
  public source: Observable<unknown[]>;

  @Input()
  public options: IChartConfiguration['options'] = {};

  /**
   * Describes the format of the `source` collection format.
   *
   * The collection can represent a `single` dataset or `multi`ple data sets.
   *
   *
   * In the case of `single` mode, each item in the collection represents a value for the dataset.
   *
   * **Example**:
   *
   * ```js
   *  [
   *      // Value 1
   *      {
   *        attributes: {
   *           name: 'Name of object',
   *           value: 2
   *        }
   *      },
   *      // Value 2
   *      {...},
   *      // Value 3
   *      {...}
   *  ]
   *
   * ```
   *
   * In the case of `multi` mode, each item in the collection represents a dataset. The children within that data set
   * represent the values.
   *
   * **Example**:
   *
   * ```js
   *  [
   *      // Dataset 1
   *      [
   *         // Value 1
   *         {
   *           attributes: {
   *             name: 'Name of object',
   *             value: 2
   *          }
   *        },
   *        // Value 2
   *        {...},
   *        // Value 3
   *        {...}
   *      ],
   *       // Dataset 2
   *      [
   *        // Value 1
   *        {...},
   *        // Value 2
   *        {...}
   *      ],
   *      // Dataset 3
   *      [...]
   *  ]
   *
   * ```
   */
  @Input()
  public mode: 'single' | 'multi';

  /**
   * Resolvable dataset item property path, used as a value entry in a dataset.
   *
   * Expects a `string[]` when `mode` is set to `single`. Each path represents a path for a matching transformation,
   * if any/required. If a given transformation index does not accept a path or is to be omitted, provide the `null` keyword
   * in place of a valid path.
   *
   * Expects a `string[][]` when `mode` is set to `multi`. Each top-level collection represents a dataset. Within each dataset,
   * each path represents a path for a matching transformation if any/required. If a given transformation index does not accept
   * a path or is to be omitted, provide the `null` keyword in place of a valid path.
   *
   * Dot notation is supported.
   *
   * **Example**
   *
   * Given the dataset:
   *
   * ```js
   *  [
   *      // Dataset item 1
   *      {
   *        attributes: {
   *           name: 'Name of object',
   *           value: 2
   *        }
   *      },
   *      // Dataset item 2
   *      {...},
   *      // Dataset item 3
   *      {...}
   *  ]
   * ```
   *
   * With one transformation applied, providing `['attributes.name']` as the path will resolve to "Name of object" for the Dataset item 1.
   *
   */
  @Input()
  public paths: Array<string> | Array<Array<string>>;

  /**
   * Describes a series of transformational operations performed on the `source` collection that ultimately reduce it to a
   * series of dataset values.
   *
   * Expects a `string[]` when `mode` is set to `single`.
   *
   * Expects a `string[][]` when `mode` is set to `multi`.
   *
   *
   * If no transformations provided, the resolved `path` value will be used.
   *
   * Supported transformations:
   *
   *  - categorize
   *  - count
   *
   * Each of the transformations in the transformation collection will be executed sequentially.
   * This allows creating transformation pipelines by consuming the output of one transformation into the next.
   */
  @Input()
  public transformations: Array<string> | Array<Array<string>>;

  /**
   * Series display labels for a dataset.
   */
  @Input()
  public labels: Array<string>;

  /**
   * Chart title.
   */
  @Input()
  public title: string;

  /**
   * Lays out the structure of a base configuration.
   *
   * Subclasses are responsible for creating data sets and appending
   * them to the base config which is later passed down to the chart
   * container.
   */
  public baseConfig: ChartConfiguration;

  /**
   * Transformed `source` data into a `ChartConfiguration` format passed to the `ChartContainerComponent` responsible
   * for rendering the chart.
   */
  public chartData: Observable<ChartConfiguration>;

  /**
   * ChartContainer component reference.
   *
   * BaseChart sub-classes must include a chart container component in their template.
   *
   * Chart container is responsible for rendering chart.
   */
  @ViewChild(ChartContainerComponent, { static: true })
  public chart: ChartContainerComponent;

  constructor() {}

  /**
   * `ChartContainerComponent`'s inside template sub-class will be available here.
   *
   * Perform simple check to make sure we can proceed with chart generation.
   */
  public ngOnInit() {
    if (this.chart === undefined) {
      throw new Error('Subclass does not contain chart container.');
    }
  }

  /**
   * Bound or injected data will be available for use on this life cycle hook.
   *
   * Every subclass will create chart config at this point in time.
   */
  public ngAfterViewInit() {
    if (this.source === undefined) {
      throw new Error('No chart data source provided.');
    }

    // On every source emission, execute the transformers which creates a data config specific
    // to the subclass calling the method.
    //
    // Generated config is returned by the scan operator which will trigger chart container to
    // create/update chart data.
    this.chartData = iif(() => 'subscribe' in this.source, this.source, of((this.source as unknown) as unknown[])).pipe(
      scan((acc, curr) => {
        let p;
        // Asserting transformations as an `any` array, otherwise compiler does not like its original
        // union type.
        if ('datasets' in curr) {
          p = curr;
        } else {
          p = (<string[]>this.transformations)
            .map((transformation, index) => {
              const transformed = {
                value: this.evaluateTransformSet(transformation, this.paths[index], curr).value,
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
        }

        // Call the sub-class updateData() method that will reformat data output into a suitable format
        // based on its chart type.
        this.baseConfig.updateData(p);

        this.baseConfig.mergeOptions(this.options);

        // Emit generated config.
        return this.baseConfig;
      }, new ChartConfiguration())
    );

    this.chart.create(this.chartData);
  }

  /**
   * For a provided transformation set, will execute the transformation function with the paths as
   * transformation function parameters.
   *
   * @param set - Transformation(s)
   * @param paths - Path(s), which function as transformation function parameters
   * @param collection - Initial collection (seed), or the previous value if it's in a recursive function call.
   */
  private evaluateTransformSet<T>(set: string | Array<string>, paths: string | Array<string>, collection: Array<T>) {
    // If the transformation set is an array, a further function call is required to evaluate it completely.
    if (set instanceof Array) {
      return set.reduce(
        (acc, curr, i) => {
          const evaluated = {
            value: this.evaluateTransformSet(curr, paths[i], acc.value)
          };

          return evaluated;
        },
        {
          value: collection
        }
      );
    } else {
      // If the transformation provided is a primitive (string), then execute the named function providing the paths as parameters.
      if (op.hasOwnProperty(set)) {
        // Parameters can be single primitive values or multiple. Normalize before named function call.
        const params = paths instanceof Array ? paths : [paths];

        // Execute the named function providing params array as param overloads.
        const result = op[set](collection, ...params);

        return result;
      } else {
        throw new Error(`Invalid chart operator: ${set}`);
      }
    }
  }
}
