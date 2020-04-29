import { Component, OnDestroy, OnInit } from '@angular/core';
import { County, CountyClaim, FieldCategory, User, TestingSite } from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService, TestingSitesService, WebsitesService, WebsiteTypesService, FormattedTestingSite } from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '../../../../services/identity.service';
import { Observable, VirtualTimeScheduler } from 'rxjs';
import { switchMap, pluck, filter, withLatestFrom, map } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

@Component({
  selector: 'tamu-gisc-my-dashboard-testing-sites',
  templateUrl: './my-dashboard-testing-sites.component.html',
  styleUrls: ['./my-dashboard-testing-sites.component.scss']
})
export class MyDashboardTestingSitesComponent implements  OnInit, OnDestroy {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public testingSites: Observable<Array<Partial<TestingSite>>>;

  constructor(
    private ts: TestingSitesService,
    private is: IdentityService
  ) { }

  ngOnInit() {
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

  ngOnDestroy() {
    // this._$destroy.next();
    // this._$destroy.complete();
  }

  

}
