import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { from, Observable, of, forkJoin, combineLatest } from 'rxjs';
import { switchMap, filter, toArray, shareReplay, startWith, mergeMap, reduce, tap } from 'rxjs/operators';

import * as deepMerge from 'deepmerge';

import { Sites, NodeGroups, DataGroups, DataGroupFlds, WeatherfluxExpanded } from '@tamu-gisc/two/common';

import { SitesService } from './services/sites/sites.service';
import { NodeTypesService } from './services/node-types/node-types.service';
import { DataGroupsService } from './services/data-groups/data-groups.service';
import { FieldsService } from './services/fields/fields.service';
import { DataService } from './services/data/data.service';
import { IChartConfiguration } from '@tamu-gisc/charts';

@Component({
  selector: 'tamu-gisc-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss']
})
export class DataViewerComponent implements OnInit {
  public form: FormGroup;
  public formChanges;

  public sites: Observable<Sites[]>;
  public nodeGroups: Observable<NodeGroups[]>;
  public dataGroups: Observable<DataGroups[]>;
  public fields: Observable<DataGroupFlds[]>;

  public chartData;

  // Global chart options
  public chartOptions: Partial<IChartConfiguration['options']> = {
    scales: {
      xAxes: [
        {
          type: 'time',
          distribution: 'series',
          time: {
            unit: 'day'
          }
        }
      ]
    },
    legend: {
      position: 'bottom'
    },
    plugins: {
      colorschemes: {
        scheme: 'brewer.Paired8'
      }
    }
  };

  // Settings applied to each individual dataset
  public datasetChartOptions = {
    fill: false
  };

  public formState = 0;

  public formStates = {
    0: {
      text: 'Generate Charts'
    },
    1: {
      text: 'Loading...'
    },
    2: {
      text: 'Error'
    }
  };

  constructor(
    private s: SitesService,
    private n: NodeTypesService,
    private d: DataGroupsService,
    private f: FieldsService,
    private dd: DataService,
    private formBuilder: FormBuilder
  ) {}

  public ngOnInit() {
    this.form = this.formBuilder.group({
      sitesList: [[], Validators.required],
      nodeType: [undefined, Validators.required],
      dataGroup: [undefined, Validators.required],
      fieldList: [[], Validators.required],
      startDate: [new Date(1572584400000), Validators.required],
      endDate: [new Date(), Validators.required]
    });

    this.form.valueChanges.subscribe((changes) => {
      this.formChanges = changes;
    });

    this.sites = this.s.getData().pipe(
      switchMap((sites) => {
        return from(sites);
      }),
      filter((site) => {
        return site.enabled === true;
      }),
      toArray(),
      shareReplay(1)
    );

    this.nodeGroups = this.n.getData().pipe(shareReplay(1));

    this.dataGroups = this.form.controls.nodeType.valueChanges.pipe(
      // Reset the data group form control
      tap(() => this.form.controls.dataGroup.reset(undefined)),
      startWith(this.form.controls.nodeType.value),
      switchMap((nodeID) => {
        return this.d.getData(nodeID ? nodeID : this.form.controls.nodeType.value);
      }),
      shareReplay(1)
    );

    this.fields = this.form.controls.dataGroup.valueChanges.pipe(
      // Reset the field list form control
      tap(() => this.form.controls.fieldList.reset([])),
      startWith(this.form.controls.dataGroup.value),
      switchMap((groupID) => {
        return this.f.getData(groupID ? groupID : this.form.controls.dataGroup.value);
      }),
      shareReplay(1)
    );
  }

  public submit() {
    console.dir(this.form.getRawValue());

    // return;

    const dataReqs = from(this.form.controls.fieldList.value).pipe(
      tap(() => (this.formState = 1)),
      mergeMap((field: string) => {
        return from(this.form.controls.sitesList.value).pipe(
          mergeMap((site: string) => {
            return this.dd.getFieldData({
              node: this.form.controls.nodeType.value,
              fields: [field],
              sites: [site],
              startDate: this.form.controls.startDate.value,
              endDate: this.form.controls.endDate.value
            });
          })
        );
      }),
      reduce((acc, curr) => {
        return [...acc, ...curr];
      })
    );

    this.chartData = forkJoin([dataReqs]).pipe(
      switchMap(([rows]) => {
        return from(rows);
      }),
      reduce((acc: object, curr: WeatherfluxExpanded) => {
        // All response objects return 4 key-value pairs.
        // Three keys are known, where the remaining one is the request field.
        // Filter it out.
        const knownKeys = ['sitecode', 'siteid', 'timestamp'];
        const seriesKey = Object.keys(curr).find((k) => knownKeys.indexOf(k) === -1);

        // If the series key (field name) is not a key in the accumulated seed, create a new object
        // These represent a chart dataset (plot by field)
        if (acc[seriesKey] === undefined) {
          acc[seriesKey] = {};
        }

        // If the series key in the accumulated seed does not have a key with the site code, create it.
        // Individual rows will be inserted into these arrays, representing a chart dataset series. (sites are series of a field chart)
        if (acc[seriesKey][curr.sitecode] === undefined) {
          acc[seriesKey][curr.sitecode] = {
            label: curr.sitecode,
            data: []
          };
        }

        acc[seriesKey][curr.sitecode].data.push({ t: new Date(curr.timestamp), y: curr[seriesKey] });

        return acc;
      }, {}),
      // Flatten the series
      switchMap((grouped) => {
        // Get the field list along with the grouped. Fields will be used to set labels and chart title.
        return combineLatest([of(grouped), this.fields]);
      }),
      switchMap(([grouped, fields]) => {
        const mapped = Object.entries(grouped).map(([key, dataset]) => {
          // Find the field from fields list where field name matches the current grouped key (is a lower-cased field name)
          const field = fields.find((f) => f.field.fieldName.toLowerCase() === key).field;

          return {
            data: {
              datasets: [
                ...Object.entries(dataset).map(([k, series], index) => {
                  return { ...series, ...this.datasetChartOptions };
                })
              ]
            },
            options: deepMerge(this.chartOptions, {
              title: {
                text: field.fieldDescription
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true
                    },
                    scaleLabel: {
                      display: true,
                      labelString: `${field.fieldName} (${field.fieldUnits})`
                    }
                  }
                ]
              }
            })
          };
        });

        return of(mapped);
      }),
      tap(() => (this.formState = 0)),
      shareReplay(1)
    );
  }
}
