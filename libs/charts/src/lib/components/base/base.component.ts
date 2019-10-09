import { Component, ViewChild, Input, AfterViewInit, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

import { op } from '../../operators/common/common-chart-operators';
import { ChartContainerComponent, ChartConfiguration } from '../chart-container/chart-container.component';

@Component({
  template: '',
  styleUrls: ['base.component.scss']
})
export class BaseChartComponent implements OnInit, AfterViewInit {
  /**
   * A collection of items (esri graphics or otherwise) used in processing to generate the `ChartConfig` datasets.
   */
  @Input()
  public source: Observable<any>;

  /**
   * Describes the format of the `source` collection format.
   *
   * The collection can represent a `single` dataset or `multi`ple datasets.
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
   * In the case of `multi` mode, each item in the collection represents a dataset. The children within that dadtaset
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
   * With one transofmration applied, providing `['attributes.name']` as the path will resolve to "Name of object" for the Dataset item 1.
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
   * Each of the transformatinos in the transformation collection will be executed sequentially.
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
   * Subclasses are responsible for creating datasets and appending
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
   * ChartContaer component reference.
   *
   * BaseChart sub-classes must include a chart container component in their template.
   *
   * Chart container is responsible for rendering chart.
   */
  @ViewChild(ChartContainerComponent, { static: true })
  public chart: ChartContainerComponent;

  constructor() {}

  /**
   * `ChartContainerComponent`'s inside template subcless will be avilable here.
   *
   * Perform simple check to make sure we can proceed with chart generation.
   */
  public ngOnInit() {
    if (this.chart === undefined) {
      throw new Error('Subclass does not contain chart container.');
    }
  }

  /**
   * Bound or injected data will be avaiable for use on this lifecycle hook.
   *
   * Every subclass will create chart config at this point in time.
   */
  public ngAfterViewInit() {
    if (this.source === undefined) {
      throw new Error('No chart data source provided.');
    }

    // On eveery source emission, execute the transformers which creates a data config specific
    // to the subclass calling the method.
    //
    // Generated config is returned by the scan operator which will trigger chart container to
    // create/update chart data.
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

        // Call the sub-class updateData() method that will reformat data output into a suitable format
        // based on its chart type.
        this.baseConfig.updateData(p);

        // Emit generated config.
        return this.baseConfig;
      }, [])
    );

    this.chart.create(this.chartData);
  }

  /**
   * For a provided transfromation set, will iterate through inner children and execute any operators with
   * respective `paths`.
   *
   * @param {(string | Array<string>)} set - Transformation set
   * @param {Array<T>} collection - Initial collection (seed), or the previou value if it's in a recursive call.
   * @param {number} [setIndex] - The transformation set index. Represents the index of the current dataset
   * being processed.
   * @param {number} [setDepth] - The transformation index. Represents the index of the current transformation, relative
   * to the dataset index.
   */
  private valueForTransformationSet<T>(
    set: string | Array<string>,
    collection: Array<T>,
    setIndex?: number,
    setDepth?: number
  ) {
    if (set instanceof Array) {
      return set.reduce(
        (acc, curr, i) => {
          const evaluated = {
            value: this.valueForTransformationSet(curr, acc.value, i, acc.depth),
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
        throw new Error(`Invalid chart operator: ${set}`);
      }
    }
  }
}
