import {
  enableProdMode,
  provideZoneChangeDetection,
  importProvidersFrom,
  provideAppInitializer,
  inject
} from '@angular/core';

import * as WebFont from 'webfontloader';
import * as environment from './environments/environment';
import { AuthService, AuthInterceptor } from '@tamu-gisc/geoservices/data-access';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ViewportScroller } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { Angulartics2Module } from 'angulartics2';
import { withInMemoryScrolling, provideRouter, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  {
    path: 'internal',
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.geoservicesInternalRoutes)
    // canActivateChild: [AuthGuard]
  },
  {
    path: 'docs',
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.geoservicesApiRoutes)
  },
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.geoservicesPublicRoutes)
  }
];

function getHighlightLanguages() {
  return {
    xml: () => import('highlight.js/lib/languages/xml'),
    json: () => import('highlight.js/lib/languages/json'),
    javascript: () => import('highlight.js/lib/languages/javascript')
  };
}

if (environment.environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Ubuntu:300,400,500,600', 'Muli:300,400']
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(
      BrowserModule,
      Angulartics2Module.forRoot(),
      BrowserAnimationsModule,
      HighlightPlusModule,
      EnvironmentModule,
      LocalStoreModule,
      NotificationModule
    ),
    AuthService,
    provideAppInitializer(() => {
      // Start AuthService's login-state request at boot, as AppModule's constructor did.
      inject(AuthService);
      // RouterModule.forRoot's scrollOffset option, which provideRouter has no counterpart for.
      inject(ViewportScroller).setOffset([0, 64]);
    }),
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
        languages: getHighlightLanguages()
      }
    },
    {
      provide: env,
      useValue: environment
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }))
  ]
}).catch((err) => console.error(err));
