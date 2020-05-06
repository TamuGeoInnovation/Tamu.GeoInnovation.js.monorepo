import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, pluck, switchMap, shareReplay } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { County, User } from '@tamu-gisc/covid/common/entities';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';
import { ActiveLockdown, LockdownsService } from '@tamu-gisc/geoservices/data-access';

@Component({
  selector: 'tamu-gisc-dashboard-lockdowns',
  templateUrl: './dashboard-lockdowns.component.html',
  styleUrls: ['./dashboard-lockdowns.component.scss']
})
export class DashboardLockdownsComponent implements OnInit {
  public localCounty: Observable<DeepPartial<County>>;
  public localEmail: Observable<Partial<User['email']>>;
  public lockdowns: Observable<Partial<ActiveLockdown>>;

  constructor(private ls: LockdownsService, private is: IdentityService) {}

  public ngOnInit() {
    this.lockdowns = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      }),
      switchMap((email) => {
        return this.ls.getAllLockdownsForUser(email);
      }),
      shareReplay(1)
    );
  }
}
