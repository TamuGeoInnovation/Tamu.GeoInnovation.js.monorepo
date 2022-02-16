import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'gisday-angular';

  constructor(public oidcSecurityService: OidcSecurityService) {}

  public ngOnInit() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
      console.log('app authenticated', isAuthenticated);
      console.log('User data', userData);
      console.log(`Current access token is ${accessToken}`);
    });
  }
}
