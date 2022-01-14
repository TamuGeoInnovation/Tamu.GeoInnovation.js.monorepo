import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IdentityService } from '../../../../../../../../covid/ngx/src/lib/services/identity.service';

// This component used to extend geoservices header component, including its styles
@Component({
  selector: 'tamu-gisc-header-covid',
  templateUrl: './header-covid.component.html'
})
export class HeaderCovidComponent implements OnInit {
  public hasEmail: Observable<string>;
  public loginUrl: string;
  public logoutUrl: string;

  constructor(private is: IdentityService, private environment: EnvironmentService) {
    this.hasEmail = this.is.identity.pipe(pluck('user', 'email'));
  }

  public ngOnInit() {
    this.loginUrl = `${this.environment.value('covid_api_url')}oidc/login`;
    this.logoutUrl = `${this.environment.value('covid_api_url')}oidc/logout`;
  }
}
