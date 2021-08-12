import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthOptions } from '@tamu-gisc/oidc/client';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Default auth options so they can be overwritten.
  public authOptions: AuthOptions = {
    url: undefined,
    attach_href: undefined
  };

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient, private env: EnvironmentService) {
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
  public isAuthenticated(): Observable<IIsAuthenticatedResults> {
    return this.http.get(this.cleanUrl(this.authOptions.url) + '/oidc/userinfo', { withCredentials: true }).pipe(
      map((result) => {
        return {
          status: true,
          code: 200
        };
      }),
      catchError((err: HttpErrorResponse) => {
        return of({
          status: false,
          code: err.status
        });
      })
    );
  }

  /**
   * Cleans the trailing end of the auth url to fix any api routing issues.
   */
  public cleanUrl(url: string): string {
    if (url.endsWith('/')) {
      return url.slice(0, url.length - 1);
    } else {
      return url;
    }
  }

  /**
   * Redirects to the auth url
   *
   * If auth options allow attaching a return URL, window location will be used by default
   *
   * @param {string} [returnUrl] Overwrite the default window location return url
   */
  public redirect(returnUrl?: string) {
    if (typeof this.authOptions === 'string') {
      this.document.location.href = `${this.authOptions}/oidc/login`;
    } else if (typeof this.authOptions === 'object') {
      const ret = returnUrl ? returnUrl : window.location.href;

      this.document.location.href = `${this.cleanUrl(this.authOptions.url)}/oidc/login${
        this.authOptions.attach_href === true ? `?ret=${ret}` : ''
      }`;
    } else {
      console.warn('No auth url provided. Cannot redirect.');
    }
  }
}

export interface IIsAuthenticatedResults {
  /**
   * Whether or not the user is authenticated
   */
  status: boolean;

  /**
   * The code returned by the authentication request.
   *
   * Will be 401 or 403 if not authenticated or authorized, respectively.
   */
  code: number;
}
