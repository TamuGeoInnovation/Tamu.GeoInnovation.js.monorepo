import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  public canActivate() {
    this.oidcSecurityService.authorize();

    return true;
  }
}
