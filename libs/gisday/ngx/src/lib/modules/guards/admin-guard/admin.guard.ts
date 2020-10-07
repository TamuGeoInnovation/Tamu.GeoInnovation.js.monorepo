import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, IUserInfoResponse } from '@tamu-gisc/gisday/data-access';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.getUserRole().pipe(
      map((value) => {
        if (value.role.level_role === '99') {
          return true;
        } else {
          return false;
        }
      })
    );
  }
}
