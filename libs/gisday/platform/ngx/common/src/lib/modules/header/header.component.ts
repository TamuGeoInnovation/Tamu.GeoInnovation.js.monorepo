import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import {} from '@tamu-gisc/common/ngx/router';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

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
  public activeSeason$: Observable<Season>;

  public isActive$ = new Subject();
  public isMobile$ = this.rp.isMobile.pipe(shareReplay(1));
  public isAbsolute$: Observable<boolean>;
  public logoVisible$: Observable<boolean>;

  constructor(
    private readonly rp: ResponsiveService,
    private readonly as: AuthService,
    private readonly ss: SeasonService,
    private readonly rt: Router,
    private readonly at: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.loggedIn$ = this.as.isAuthenticated$;
    this.userRoles$ = this.as.userRoles$;
    this.activeSeason$ = this.ss.activeSeason$;

    const currUrl = this.rt.events.pipe(
      map((e) => e instanceof NavigationEnd),
      map(() => {
        return this.rt.url;
      }),
      distinctUntilChanged()
    );
    // Header should not be visible when the activated route is the base route.
    this.logoVisible$ = currUrl.pipe(
      map((url) => {
        return url !== '/';
      }),
      distinctUntilChanged()
    );
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
