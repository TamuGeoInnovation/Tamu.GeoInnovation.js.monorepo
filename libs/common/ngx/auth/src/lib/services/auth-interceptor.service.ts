import { Provider } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private environment: EnvironmentService,
    private auth: AuthService
  ) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<unknown>) => {
          // No operation here. Only concerned with authentication errors.
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 403 || err.status === 401) {
              if (typeof this.auth.authOptions === 'string') {
                this.document.location.href = `${this.auth.authOptions}/oidc/login`;
              } else if (typeof this.auth.authOptions === 'object') {
                this.document.location.href = `${this.auth.authOptions.url}/oidc/login${
                  this.auth.authOptions.attach_href === true ? '?ret=' + window.location.href : ''
                }`;
              } else {
                throw new Error('Error resolving client auth API settings.');
              }
            }
          }
        }
      )
    );
  }
}

export const AuthProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
