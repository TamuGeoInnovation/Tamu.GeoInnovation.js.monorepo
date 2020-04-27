import { Component, OnDestroy, OnInit } from '@angular/core';
import { County, CountyClaim, FieldCategory, User } from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService, TestingSitesService, WebsitesService, WebsiteTypesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '../../../../services/identity.service';
import { Observable, VirtualTimeScheduler } from 'rxjs';
import { switchMap, pluck, filter, withLatestFrom, map } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

@Component({
  selector: 'tamu-gisc-my-dashboard-county-claims',
  templateUrl: './my-dashboard-county-claims.component.html',
  styleUrls: ['./my-dashboard-county-claims.component.scss']
})
export class MyDashboardCountyClaimsComponent implements  OnInit, OnDestroy {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public counties: Observable<Array<Partial<CountyClaim>>>;

  constructor(
    private cl: CountyClaimsService,
    private is: IdentityService
  ) { }

  ngOnInit() {
    // this.localCounty = this.is.identity.pipe(
    //   pluck('claim', 'county'),
    //   filter((county) => {
    //     return county !== undefined && county.countyFips !== undefined;
    //   })
    // );
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

  ngOnDestroy() {
    // this._$destroy.next();
    // this._$destroy.complete();
  }

  

}
