import { Component, OnDestroy, OnInit } from '@angular/core';
import { County, CountyClaim, FieldCategory, User, TestingSite, Lockdown } from '@tamu-gisc/covid/common/entities';
import { CountyClaimsService, LockdownsService, WebsitesService, WebsiteTypesService, FormattedTestingSite, ActiveLockdown } from '@tamu-gisc/geoservices/data-access';
import { IdentityService } from '../../../../services/identity.service';
import { Observable, VirtualTimeScheduler } from 'rxjs';
import { switchMap, pluck, filter, withLatestFrom, map } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

@Component({
  selector: 'tamu-gisc-my-dashboard-lockdowns',
  templateUrl: './my-dashboard-lockdowns.component.html',
  styleUrls: ['./my-dashboard-lockdowns.component.scss']
})
export class MyDashboardLockdownsComponent implements  OnInit, OnDestroy {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public lockdowns: Observable<Partial<ActiveLockdown>>;

  constructor(
    private ls: LockdownsService,
    private is: IdentityService
  ) { }

  ngOnInit() {
    this.lockdowns = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      }),
      switchMap((email) => {
        return this.ls.getAllLockdownsForUser(email);
      })
    );
    
    
  }

  ngOnDestroy() {
    // this._$destroy.next();
    // this._$destroy.complete();
  }

  

}
