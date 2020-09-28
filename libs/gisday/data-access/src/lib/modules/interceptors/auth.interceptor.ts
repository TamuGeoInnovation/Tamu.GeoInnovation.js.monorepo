import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(@Inject(DOCUMENT) private document: Document, private environment: EnvironmentService) {}

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<unknown>) => {
          // No operation here. Only concerned with authentication errors.
        },
        (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 403) {
              this.document.location.href = `${this.environment.value('api_url')}oidc/login`;
            }
          }
        }
      )
    );
  }
}
