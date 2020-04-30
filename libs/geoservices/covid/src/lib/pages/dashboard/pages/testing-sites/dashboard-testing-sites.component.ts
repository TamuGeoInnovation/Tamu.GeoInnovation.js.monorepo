import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, pluck, switchMap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { County, TestingSite, User } from '@tamu-gisc/covid/common/entities';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { TestingSitesService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-dashboard-testing-sites',
  templateUrl: './dashboard-testing-sites.component.html',
  styleUrls: ['./dashboard-testing-sites.component.scss']
})
export class DashboardTestingSitesComponent implements OnInit {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public testingSites: Observable<Array<Partial<TestingSite>>>;

  constructor(private ts: TestingSitesService, private is: IdentityService) {}

  public ngOnInit() {
    this.testingSites = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      }),
      switchMap((email) => {
        return this.ts.getSitesForUser(email);
      })
    );
  }
}
