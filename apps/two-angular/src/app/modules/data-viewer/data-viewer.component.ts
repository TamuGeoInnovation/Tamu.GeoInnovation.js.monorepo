import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { switchMap, filter, toArray, shareReplay } from 'rxjs/operators';

import { Sites, NodeGroups } from '@tamu-gisc/two/common';

import { SitesService } from './services/sites/sites.service';
import { ClassMembers } from './services/base-api/base-api.service';
import { NodeTypesService } from './services/node-types/node-types.service';

@Component({
  selector: 'tamu-gisc-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss']
})
export class DataViewerComponent implements OnInit {
  public form: FormGroup;

  public sites: Observable<ClassMembers<Sites>[]>;

  public nodeGroups: Observable<ClassMembers<NodeGroups>[]>;

  constructor(private s: SitesService, private n: NodeTypesService, private formBuilder: FormBuilder) {}

  public ngOnInit() {
    this.form = this.formBuilder.group({
      checkGroupTest: [[]],
      selectTest: [1, { disabled: true }]
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
  }

  public submit() {
    console.dir(this.form.getRawValue());
  }
}
