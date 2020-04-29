import { Component, OnInit } from '@angular/core';
import { DeepPartial } from 'typeorm';
import { Observable } from 'rxjs';
import { switchMap, pluck, filter } from 'rxjs/operators';

import { County, CountyClaim, User } from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService } from '@tamu-gisc/geoservices/data-access';

import { IdentityService } from '../../../../services/identity.service';

@Component({
  selector: 'tamu-gisc-my-dashboard-county-claims',
  templateUrl: './my-dashboard-county-claims.component.html',
  styleUrls: ['./my-dashboard-county-claims.component.scss']
})
export class MyDashboardCountyClaimsComponent implements OnInit {
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
      })
    );
  }
}
