import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  public canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.isAuthenticated();
  }

  public canActivateChild(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.isAuthenticated();
  }

  public canLoad(): Observable<boolean> | Promise<boolean> | boolean {
    return this.auth.isAuthenticated();
  }
}
