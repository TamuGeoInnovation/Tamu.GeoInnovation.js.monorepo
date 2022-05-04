import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { UserInfo } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService extends BaseService<UserInfo> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient, public oidcSecurityService: OidcSecurityService) {
    super(env1, http1, oidcSecurityService, 'user-info');
  }

  public getEntityWithUserGuid() {
    return this.http1.get<Partial<UserInfo>>(`${this.resource}`, {
      headers: this.headers
    });
  }
}
