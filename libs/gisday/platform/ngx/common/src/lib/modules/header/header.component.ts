import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticatedResult, OidcSecurityService } from 'angular-auth-oidc-client';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';
import { ResponsiveService } from '@tamu-gisc/dev-tools/responsive';

@Component({
  selector: 'tamu-gisc-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public $loggedIn: Observable<AuthenticatedResult>;

  public isActive = new Subject();
  public $logoVisible: Observable<boolean>;
  public isMobile = this.rp.isMobile.pipe(shareReplay(1));

  constructor(
    private location: Location,
    private routerHistory: RouterHistoryService,
    private rp: ResponsiveService,
    private oidcSecurityService: OidcSecurityService
  ) {}

  public ngOnInit() {
    this.$loggedIn = this.oidcSecurityService.isAuthenticated$;

    this.$logoVisible = this.routerHistory.history.pipe(
      map(() => {
        return this.location.path() !== '';
      }),
      shareReplay()
    );
  }
}
