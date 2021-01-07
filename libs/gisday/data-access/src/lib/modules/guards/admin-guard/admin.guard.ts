import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { map } from 'rxjs/operators';

import { AuthService } from '../../services/auth/auth.service';

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
