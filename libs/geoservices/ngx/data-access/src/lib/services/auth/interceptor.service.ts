import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AuthOptions } from '@tamu-gisc/oidc/client';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(DOCUMENT) private document: Document, private environment: EnvironmentService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const urlOrOptions: string | AuthOptions =
      this.environment.value('auth_url', true) || this.environment.value('auth_options', true);

    return next.handle(req).pipe(
      tap(
        () => {
          // No operation here. Only concerned with authentication errors.
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 403) {
              if (typeof urlOrOptions === 'string') {
                this.document.location.href = `${urlOrOptions}oidc/login`;
              } else if (typeof urlOrOptions === 'object') {
                this.document.location.href = `${urlOrOptions.url}oidc/login${
                  urlOrOptions.attach_href === true ? '?ret=' + window.location.href : ''
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
