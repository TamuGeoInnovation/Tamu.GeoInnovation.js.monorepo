import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CATEGORY } from '@tamu-gisc/covid/common/enums';
import { TestingSitesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-testing-sites-list',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSiteListComponent implements OnInit {
  public testingSites: Observable<Array<Partial<FormattedTestingSite>>>;

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
