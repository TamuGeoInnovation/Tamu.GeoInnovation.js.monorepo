import { Component, OnInit } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = 'gisday-angular';

  constructor(private readonly as: AuthService) {}

  public ngOnInit() {
    console.log('gisday app init');
    // this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
    //   if (environment.production !== true) {
    //     console.log('app authenticated', isAuthenticated);
    //     console.log('User data', userData);
    //     console.log(`Current access token is ${accessToken}`);
    //   }
    // });
  }
}

