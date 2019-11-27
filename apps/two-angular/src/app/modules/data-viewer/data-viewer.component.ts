import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';
import { switchMap, filter, toArray, shareReplay } from 'rxjs/operators';

import { SitesService } from './services/sites/sites.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ClassMembers } from './services/base-api/base-api.service';
import { Sites } from '@tamu-gisc/two/common';

@Component({
  selector: 'tamu-gisc-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss']
})
export class DataViewerComponent implements OnInit {
  public form: FormGroup;

  public sites: Observable<ClassMembers<Sites>[]>;

  public fields: Observable<boolean>;

  constructor(private s: SitesService, private formBuilder: FormBuilder) {}

  public ngOnInit() {
    this.form = this.formBuilder.group({
      checkTest: [true],
      checkGroupTest: [[]]
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
  }
}
