import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';
import * as environment from './environments/environment';
import { Title, BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { env } from '@tamu-gisc/common/ngx/environment';
import { HTTP_INTERCEPTORS, provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { ROLES_CLAIM } from '@tamu-gisc/common/ngx/auth';
import { Angulartics2Module } from 'angulartics2';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE, siteFeatureGuard } from '@tamu-gisc/gisday/platform/ngx/common';

const routes: Routes = [
  {
    path: 'app',
    canActivate: [siteFeatureGuard('competitions')],
    loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.publicRoutes)
  },
  {
    path: 'callback',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.callbackRoutes)
  },
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.wrapperRoutes)
  }
];
const routeOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};

const site = gisdaySite(environment.site);

// index.html carries txgisday.org's title and icon, which the other sites replace here.
document.title = site.name;
document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', site.favicon);

if (environment.environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:400,600,700', 'Source Sans Pro:200,400,600,800']
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(
      Angulartics2Module.forRoot(),
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production }),
      AuthModule.forRoot({
        domain: environment.auth0.domain,
        clientId: environment.auth0.client_id,
        authorizationParams: {
          audience: environment.auth0.audience,
          redirect_uri: environment.auth0.redirect_uri
        },
        httpInterceptor: {
          allowedList: [
            {
              allowAnonymous: true,
              uriMatcher: (url) => {
                // Type assertion because the static value is a token replaced at runtime
                return (environment.auth0.urls as unknown as Array<string>).some((u) => url.startsWith(u));
              }
            }
          ]
        }
      }),
      BrowserModule,
      BrowserAnimationsModule,
      RouterModule.forRoot(routes, routeOptions),
      FormsModule,
      ReactiveFormsModule
    ),
    Title,
    {
      provide: GISDAY_SITE,
      useValue: site
    },
    {
      provide: env,
      useValue: environment
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true
    },
    {
      provide: ROLES_CLAIM,
      useValue: environment.auth0.roles_claim
    },
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ]
}).catch((err) => console.error(err));
