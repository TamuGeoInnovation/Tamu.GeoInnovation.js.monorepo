import { Component, OnInit } from '@angular/core';

import { OidcSecurityService } from 'angular-auth-oidc-client';
import { environment } from '../environments/environment';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  public ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated }) => {
      if (environment.production !== true) {
        console.log('app authenticated', isAuthenticated);
      }
    });
  }
}
