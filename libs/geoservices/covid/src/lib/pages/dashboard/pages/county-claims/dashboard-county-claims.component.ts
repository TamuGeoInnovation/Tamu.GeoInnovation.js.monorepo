import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, pluck, switchMap, shareReplay } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { County, CountyClaim, User } from '@tamu-gisc/covid/common/entities';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { CountyClaimsService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-dashboard-county-claims',
  templateUrl: './dashboard-county-claims.component.html',
  styleUrls: ['./dashboard-county-claims.component.scss']
})
export class DashboardCountyClaimsComponent implements OnInit {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public counties: Observable<Array<Partial<CountyClaim>>>;

  constructor(private cl: CountyClaimsService, private is: IdentityService) {}

  public ngOnInit() {
    this.counties = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      }),
      switchMap((email) => {
        return this.cl.getAllUserCountyClaimsSortedByCounty(email);
      }),
      shareReplay(1)
    );
  }
}
