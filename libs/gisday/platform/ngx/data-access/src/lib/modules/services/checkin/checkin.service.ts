import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { CheckIn } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class CheckinService extends BaseService<CheckIn> {
  public withCredentials = true;
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient, public oidcSecurityService: OidcSecurityService) {
    super(env1, http1, oidcSecurityService, 'check-in');
  }

  public insertUserCheckin(eventGuid: string) {
    return this.http1
      .post(
        `${this.resource}/user`,
        {
          eventGuid: eventGuid
        },
        {
          withCredentials: this.withCredentials
        }
      )
      .subscribe((result) => {
        console.log(result);
      });
  }
}
