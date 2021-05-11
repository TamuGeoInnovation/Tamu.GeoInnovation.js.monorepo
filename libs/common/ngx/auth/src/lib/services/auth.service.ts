import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthOptions } from '@tamu-gisc/oidc/client';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authOptions: AuthOptions;

  constructor(private http: HttpClient, private env: EnvironmentService) {
    if (this.env.value('auth_url', true)) {
      this.authOptions.url = this.env.value('auth_url', true);
    } else if (this.env.value('auth_options', true)) {
      this.authOptions = this.env.value('auth_options', true);
    } else {
      throw new Error('App authentication requires auth_url or auth_options.');
    }
  }

  /**
   * Send a request for user info and determines based on the response if the user is authenticated.
   *
   * Unauthorized requests will throw an error and result in a `false` result.
   *
   * This method works best with HTTP interceptors to redirect to login if a 401/403 is returned.
   */
  public isAuthenticated() {
    return this.http.get(this.authOptions.url + '/oidc/userinfo', { withCredentials: true }).pipe(
      map((result) => {
        return true;
      }),
      catchError((err) => {
        return of(false);
      })
    );
  }
}
