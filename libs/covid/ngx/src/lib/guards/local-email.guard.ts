import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

import { IdentityService } from '../services/identity.service';

@Injectable({ providedIn: 'root' })
export class LocalEmailGuard implements CanActivate {
  constructor(public is: IdentityService, public router: Router) {}

  public canActivate() {
    return this.is.identity.pipe(
      pluck('user'),
      switchMap((user) => {
        return of(user.email !== undefined);
      })
    );
  }
}
