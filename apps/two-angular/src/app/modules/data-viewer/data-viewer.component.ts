import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { switchMap, filter, toArray, shareReplay, startWith } from 'rxjs/operators';

import { Sites, NodeGroups, DataGroups, DataGroupFlds } from '@tamu-gisc/two/common';

import { SitesService } from './services/sites/sites.service';
import { NodeTypesService } from './services/node-types/node-types.service';
import { DataGroupsService } from './services/data-groups/data-groups.service';
import { FieldsService } from './services/fields/fields.service';

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

  constructor(
    private s: SitesService,
    private n: NodeTypesService,
    private d: DataGroupsService,
    private f: FieldsService,
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
  }
}
