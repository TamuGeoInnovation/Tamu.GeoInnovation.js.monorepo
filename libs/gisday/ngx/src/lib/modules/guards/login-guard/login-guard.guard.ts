import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService, ITokenIntrospectionResponse } from '@tamu-gisc/gisday/data-access';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
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
