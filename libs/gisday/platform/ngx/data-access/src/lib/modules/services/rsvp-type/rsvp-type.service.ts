import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { OidcSecurityService } from 'angular-auth-oidc-client';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class RsvpTypeService extends BaseService<RsvpType> {
  public resource: string;

  constructor(private env1: EnvironmentService, private http1: HttpClient, public oidcSecurityService: OidcSecurityService) {
    super(env1, http1, oidcSecurityService, 'rsvp-type');
  }
}
