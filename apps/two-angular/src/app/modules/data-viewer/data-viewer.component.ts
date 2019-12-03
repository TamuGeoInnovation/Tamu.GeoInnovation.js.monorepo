import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { from, Observable, of, forkJoin } from 'rxjs';
import { switchMap, filter, toArray, shareReplay, startWith, mergeMap, reduce } from 'rxjs/operators';

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
  public chartOptions: Partial<IChartConfiguration['options']> = {
    fill: 'end',
    scales: {
      xAxes: [
        {
          type: 'time',
          time: {
            unit: 'day',
            distribution: 'series'
          }
        }
      ]
    },
    legend: {
      position: 'bottom'
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
      sitesList: [[1, 3, 4, 5], Validators.required],
      nodeType: [2, Validators.required],
      dataGroup: [22, Validators.required],
      fieldList: [['TA_1_1_1'], Validators.required],
      // startDate: [new Date(Date.now() - 604800000), Validators.required],
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
      startWith(this.form.controls.nodeType.value),
      switchMap((nodeID) => {
        return this.d.getData(nodeID ? nodeID : this.form.controls.nodeType.value);
      }),
      shareReplay(1)
    );

    this.fields = this.form.controls.dataGroup.valueChanges.pipe(
      startWith(this.form.controls.dataGroup.value),
      switchMap((groupID) => {
        return this.f.getData(groupID ? groupID : this.form.controls.dataGroup.value);
      }),
      shareReplay(1)
    );
  }

  public submit() {
    console.dir(this.form.getRawValue());

    const dataReqs = from(this.form.controls.fieldList.value).pipe(
      mergeMap((field: string) => {
        return from(this.form.controls.sitesList.value).pipe(
          mergeMap((site: string) => {
            return this.dd.getFieldData({
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

        // If the series key in the accumulated seed does not have a key with the sitecode, create it.
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
        const mapped = Object.entries(grouped).map(([key, dataset]) => {
          return {
            data: {
              datasets: [
                ...Object.entries(dataset).map(([k, series]) => {
                  return { ...series, fill: false };
                })
              ]
            },
            options: {
              title: {
                text: key
              }
            }
          };
        });

        return of(mapped);
      })
    );
  }
}
