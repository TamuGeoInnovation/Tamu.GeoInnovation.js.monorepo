import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { from, Observable, of, forkJoin, combineLatest } from 'rxjs';
import { switchMap, filter, toArray, shareReplay, startWith, mergeMap, map, flatMap } from 'rxjs/operators';

import { Sites, NodeGroups, DataGroups, DataGroupFlds } from '@tamu-gisc/two/common';

import { SitesService } from './services/sites/sites.service';
import { NodeTypesService } from './services/node-types/node-types.service';
import { DataGroupsService } from './services/data-groups/data-groups.service';
import { FieldsService } from './services/fields/fields.service';
import { DataService } from './services/data/data.service';

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

  public dumbData = of({
    datasets: [
      {
        label: 'One',
        data: [
          { t: new Date(1575172290000), y: 0.2 },
          { t: new Date(1575258690000), y: 0.75 },
          { t: new Date(1575345090000), y: 0.9 },
          { t: new Date(1575431490000), y: 0.9 }
        ]
      }
      // {
      //   label: 'Two',
      //   data: [{ x: 1, y: 1 }, { x: 3, y: 0.5 }, { x: 5, y: 0.3 }]
      // }
    ]
    // labels: [1, 2, 3, 4]
    // labels: [5, 4, 3, 2, 1]
    // labels: [1, 2, 5, 3, 4]
  });

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
      startDate: [new Date(Date.now() - 604800000), Validators.required],
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

    let reqs1 = combineLatest([of(this.form.controls.fieldList.value), of(this.form.controls.sitesList.value)])
      .pipe(
        switchMap(([f, s]) => {
          return this.dd.getFieldData({
            fields: f,
            sites: s,
            startDate: this.form.controls.startDate.value,
            endDate: this.form.controls.endDate.value
          });
        })
      )
      .subscribe((res) => {
        debugger;
      });
  }
}
