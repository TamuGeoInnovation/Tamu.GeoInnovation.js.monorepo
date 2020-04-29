import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CATEGORY } from '@tamu-gisc/covid/common/enums';
import { County, FieldCategory } from '@tamu-gisc/covid/common/entities';
import { TestingSitesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-testing-sites-list',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSiteListComponent implements OnInit {
  public counties: Observable<Array<Partial<County>>>;
  public testingSites: Observable<Array<Partial<FormattedTestingSite>>>;
  public phoneTypes: Observable<Partial<FieldCategory>>;
  public websiteTypes: Observable<Partial<FieldCategory>>;

  constructor(private ts: TestingSitesService) {}

  public ngOnInit() {
    this.testingSites = this.ts.getTestingSitesSortedByCounty().pipe(
      map((sites) => {
        return sites.map((site) => {
          // Find any instance of a response with a website type.
          const website = site.info.responses.find((r) => r.entityValue.value.category.id === CATEGORY.WEBSITES);

          if (website) {
            site.info.notes = website.entityValue.value.value;
          } else {
            site.info.notes = undefined;
          }

          return site;
        });
      })
    );
  }
}
