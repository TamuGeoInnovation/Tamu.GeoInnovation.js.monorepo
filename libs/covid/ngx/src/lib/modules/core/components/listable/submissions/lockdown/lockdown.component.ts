import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CATEGORY } from '@tamu-gisc/covid/common/enums';
import { County, FieldCategory } from '@tamu-gisc/covid/common/entities';

import {
  FormattedTestingSite,
  TestingSitesService
} from '../../../../../../data-access/testing-sites/testing-sites.service';

@Component({
  selector: 'tamu-gisc-lockdown-list',
  templateUrl: './lockdown.component.html',
  styleUrls: ['./lockdown.component.scss']
})
export class LockdownListComponent implements OnInit {
  public counties: Observable<Array<Partial<County>>>;
  public testingSites: Observable<Array<Partial<FormattedTestingSite>>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;
  public websiteTypes: Observable<Partial<FieldCategory>>;

  constructor(private ts: TestingSitesService) {}

  public ngOnInit() {
    this.testingSites = this.ts.getTestingSitesSortedByCounty().pipe(
      map((sites) => {
        sites.forEach((val) => {
          const responses = val.info.responses;
          responses.forEach((response) => {
            if (response.entityValue.value.category.id === CATEGORY.WEBSITES) {
              val.info.notes = response.entityValue.value.value;
            }
          });
        });
        return sites;
      })
    );
  }
}
