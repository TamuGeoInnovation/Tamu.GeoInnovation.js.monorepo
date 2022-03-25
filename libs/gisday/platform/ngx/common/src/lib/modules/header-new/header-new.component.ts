import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticatedResult, OidcSecurityService } from 'angular-auth-oidc-client';

import { AuthService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { IUserInfoResponse } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-app-header-new',
  templateUrl: './header-new.component.html',
  styleUrls: ['./header-new.component.scss']
})
export class HeaderNewComponent implements OnInit {
  public $loggedIn: Observable<AuthenticatedResult>;
  public userRole: Observable<IUserInfoResponse>;

  public isActive = new Subject();
  public logoVisible: Observable<boolean>;
  public isMobile = this.rp.isMobile.pipe(shareReplay(1));

  constructor(
    private authService: AuthService,
    private location: Location,
    private routerHistory: RouterHistoryService,
    private rp: ResponsiveService,
    private oidcSecurityService: OidcSecurityService
  ) {}

  public ngOnInit() {
    // this.loggedIn = this.authService.getHeaderState().pipe(shareReplay(1));
    this.$loggedIn = this.oidcSecurityService.isAuthenticated$;
    // this.oidcSecurityService.isAuthenticated$.subscribe(({ isAuthenticated }) => {
    //   console.warn('authenticated: ', isAuthenticated);
    //   console.log('Access token: ', this.oidcSecurityService.getAccessToken());
    // });

    // this.logoVisible = this.routerHistory.history.pipe(
    //   map(() => {
    //     return this.location.path() !== '';
    //   }),
    //   shareReplay()
    // );
  }
}
