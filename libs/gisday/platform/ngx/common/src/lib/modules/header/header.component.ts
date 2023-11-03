import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

import { ActiveSeasonDto, Place } from '@tamu-gisc/gisday/platform/data-api';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

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
  public activeSeason$: Observable<ActiveSeasonDto>;
  public places$: Observable<Array<Partial<Place>>>;

  public mobileNavToggle: Subject<boolean> = new Subject();
  public isAbsolute$: Observable<boolean>;
  public logoVisible$: Observable<boolean>;

  // This is used strictly for the seamless header on the landing page.
  // Ideally we'd use the same logoVisible$ observable, but
  // cannot return an observable from a getter HostBinding and have it
  // evaluated correctly.
  public isHeaderSeamless = false;

  @HostBinding('class.seamless')
  public get headerSeamless() {
    return this.isHeaderSeamless;
  }

  constructor(
    private readonly as: AuthService,
    private readonly ss: SeasonService,
    private readonly ps: PlaceService,
    private readonly rt: Router,
    private readonly at: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.loggedIn$ = this.as.isAuthenticated$;
    this.userRoles$ = this.as.userRoles$;
    this.activeSeason$ = this.ss.activeSeason$;
    this.places$ = this.ps.getEntities();

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
      distinctUntilChanged(),
      tap((visible) => {
        this.isHeaderSeamless = !visible;
      })
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
