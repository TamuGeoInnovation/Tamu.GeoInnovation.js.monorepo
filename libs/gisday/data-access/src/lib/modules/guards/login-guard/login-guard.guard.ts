import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { map } from 'rxjs/operators';

import { AuthService } from '@tamu-gisc/gisday/data-access';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.state().pipe(
      map((value) => {
        if (value === false) {
          window.location.href = route.data['externalUrl'];
          return true;
        } else {
          return true;
        }
      })
    );
  }
}
