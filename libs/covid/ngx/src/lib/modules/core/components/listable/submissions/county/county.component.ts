import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CATEGORY } from '@tamu-gisc/covid/common/enums';
import { County } from '@tamu-gisc/covid/common/entities';

import {
  TestingSitesService,
  FormattedTestingSite
} from '../../../../../../data-access/testing-sites/testing-sites.service';

@Component({
  selector: 'tamu-gisc-county-list',
  templateUrl: './county.component.html',
  styleUrls: ['./county.component.scss']
})
export class CountyListComponent implements OnInit {
  public counties: Observable<Array<Partial<County>>>;
  public testingSites: Observable<Array<Partial<FormattedTestingSite>>>;

  constructor(private ts: TestingSitesService) {}

  public ngOnInit() {
    this.testingSites = this.ts.getTestingSitesSortedByCounty().pipe(
      map((sites) => {
        sites.forEach((val) => {
          const responses = val.info.responses;
          responses.forEach((response, i) => {
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
