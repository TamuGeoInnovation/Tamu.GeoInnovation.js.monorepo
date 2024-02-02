import { Provider } from '@angular/core';

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LegacyAuthService } from '../../services/auth/auth.service';

/**
 * DEPRECATED
 */
@Injectable({
  providedIn: 'root'
})
export class LegacyAuthInterceptor implements HttpInterceptor {
  constructor(private auth: LegacyAuthService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap(
        () => {
          // No operation here. Only concerned with authentication errors.
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 403) {
              this.auth.redirect();
            } else {
              throw new Error('Error resolving client auth API settings.');
            }
          }
        }
      )
    );
  }
}

export const LegacyAuthInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: LegacyAuthInterceptor,
  multi: true
};
