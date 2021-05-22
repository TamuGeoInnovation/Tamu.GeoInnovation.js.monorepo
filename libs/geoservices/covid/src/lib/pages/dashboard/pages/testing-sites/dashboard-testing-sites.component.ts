import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, pluck, switchMap, shareReplay } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { County, User } from '@tamu-gisc/covid/common/entities';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { TestingSitesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-dashboard-testing-sites',
  templateUrl: './dashboard-testing-sites.component.html',
  styleUrls: ['./dashboard-testing-sites.component.scss']
})
export class DashboardTestingSitesComponent implements OnInit {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public testingSites: Observable<Array<Partial<FormattedTestingSite>>>;

  constructor(private ts: TestingSitesService, private is: IdentityService) {}

  public ngOnInit() {
    this.testingSites = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      }),
      switchMap((email) => {
        return this.ts.getSitesForUser(email);
      }),
      shareReplay(1)
    );
  }
}
