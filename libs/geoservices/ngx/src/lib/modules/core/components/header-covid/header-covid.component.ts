import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { HeaderComponent } from '../header/header.component';
import { IdentityService } from '../../services/identity.service';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-header-covid',
  templateUrl: './header-covid.component.html',
  styleUrls: ['../header/header.component.scss']
})
export class HeaderCovidComponent extends HeaderComponent implements OnInit {
  public hasEmail: Observable<string>;
  public loginUrl: string;
  public logoutUrl: string;

  constructor(private is: IdentityService, private environment: EnvironmentService) {
    super();

    this.hasEmail = this.is.identity.pipe(pluck('user', 'email'));
  }

  public ngOnInit() {
    this.loginUrl = `${this.environment.value('covid_api_url')}oidc/login`;
    this.logoutUrl = `${this.environment.value('covid_api_url')}oidc/logout`;
  }
}
