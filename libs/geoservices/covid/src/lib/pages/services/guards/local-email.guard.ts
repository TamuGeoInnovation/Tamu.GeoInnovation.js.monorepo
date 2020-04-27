import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Subscription } from 'rxjs';
import { pluck, filter, switchMap } from 'rxjs/operators';

import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';

@Injectable()
export class LocalEmailGuard implements CanActivate {
  private result: boolean;
  constructor(public is: IdentityService, public router: Router) {
    const hasLocalEmail = this.is.identity.pipe(
      pluck('user', 'email'),
      filter((email) => {
        return email !== undefined;
      })
    );

    hasLocalEmail.subscribe((email) => {
      if (email) {
        this.result = true;
      } else {
        this.result = false;
      }
    });
  }

  public canActivate(): boolean {
    if (this.result) {
      return true;
    } else {
      return false;
    }
  }

}
