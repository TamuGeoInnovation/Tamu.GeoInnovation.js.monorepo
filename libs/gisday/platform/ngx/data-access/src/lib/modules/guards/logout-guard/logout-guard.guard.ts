import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuard implements CanActivate {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  public canActivate() {
    this.oidcSecurityService.logoff();
    return true;
  }
}
