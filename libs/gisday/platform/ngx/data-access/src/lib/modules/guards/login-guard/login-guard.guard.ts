import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  // TODO: Should we remove and just use AutoLoginPartialRoutesGuard instead?  - Aaron H (5/6/22)
  constructor(public oidcSecurityService: OidcSecurityService) {}

  public canActivate() {
    this.oidcSecurityService.authorize();

    return true;
  }
}
