import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, pluck, filter, shareReplay } from 'rxjs/operators';

import { County, User } from '@tamu-gisc/covid/common/entities';
import { TestingSitesService, StatesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';

@Component({
  selector: 'tamu-gisc-testing-sites',
  templateUrl: './testing-sites.component.html',
  styleUrls: ['./testing-sites.component.scss']
})
export class TestingSitesComponent implements OnInit {
  public sites: Observable<Array<Partial<FormattedTestingSite>>>;

  public localCounty: Observable<Partial<County['countyFips']>>;
  public localEmail: Observable<Partial<User['email']>>;

  constructor(private ts: TestingSitesService, private st: StatesService, private is: IdentityService) {}

  public ngOnInit() {
    this.sites = this.is.identity.pipe(
      pluck('claim', 'county'),
      filter((county) => {
        return county !== undefined && county.countyFips !== undefined;
      }),
      switchMap((county) => {
        return this.ts.getTestingSitesForCounty(county.countyFips);
      }),
      shareReplay(1)
    );

    this.localEmail = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      })
    );

    this.localCounty = this.is.identity.pipe(
      pluck('claim', 'county', 'countyFips'),
      filter((countyFips) => countyFips !== undefined)
    );
  }
}
