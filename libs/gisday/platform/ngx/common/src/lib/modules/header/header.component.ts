import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { AuthService } from '@tamu-gisc/common/ngx/auth';

import { GISDayRoles } from '../../roles/gisday.roles';

@Component({
  selector: 'tamu-gisc-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public loggedIn$: Observable<boolean>;
  public userRoles$: Observable<Array<string>>;
  public appRoles = GISDayRoles;

  public isActive$ = new Subject();
  public logoVisible = 'hidden';
  public isMobile$ = this.rp.isMobile.pipe(shareReplay(1));

  constructor(
    private readonly location: Location,
    private readonly routerHistory: RouterHistoryService,
    private readonly rp: ResponsiveService,
    private readonly as: AuthService
  ) {}

  public ngOnInit() {
    this.loggedIn$ = this.as.isAuthenticated$;
    this.userRoles$ = this.as.userRoles$;

    this.routerHistory.history
      .pipe(
        map(() => {
          return this.location.path() !== '' ? 'visible' : 'hidden';
        }),
        tap((visibility) => {
          this.logoVisible = visibility;
        }),
        shareReplay(1)
      )
      .subscribe();
  }

  public login() {
    this.as.login({
      appState: {
        target: '/'
      }
    });
  }

  public logout() {
    this.as.logout();
  }
}
