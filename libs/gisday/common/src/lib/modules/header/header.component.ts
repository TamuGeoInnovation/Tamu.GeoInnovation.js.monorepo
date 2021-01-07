import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { AuthService } from '@tamu-gisc/gisday/data-access';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { IUserInfoResponse } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public loggedIn: Observable<boolean>;
  public userRole: Observable<IUserInfoResponse>;

  public account: Account;
  public isActive = new Subject();
  public logoVisible: Observable<boolean>;
  public isMobile = this.rp.isMobile.pipe(shareReplay(1));

  constructor(
    private authService: AuthService,
    private location: Location,
    private routerHistory: RouterHistoryService,
    private rp: ResponsiveService
  ) {}

  public ngOnInit() {
    this.loggedIn = this.authService.getHeaderState().pipe(shareReplay(1));

    this.logoVisible = this.routerHistory.history.pipe(
      map(() => {
        return this.location.path() !== '';
      }),
      shareReplay()
    );
  }
}
