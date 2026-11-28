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
import { provideHighlightOptions } from 'ngx-highlightjs';
import { env } from '@tamu-gisc/common/ngx/environment';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ViewportScroller } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { Angulartics2Module } from 'angulartics2';
import { withInMemoryScrolling, provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  {
    path: 'internal',
    // No guard, and that is recorded rather than an oversight (#1877). AuthGuard exists in
    // @tamu-gisc/geoservices/data-access and nothing has ever used it: the line below it was commented out in this
    // app's first commit and carried through two refactors. Enabling it as written would not work, and enabling it at
    // all is a decision, not a tidy-up:
    //
    //   - it redirects a signed-out visitor to `api`, which is not a route here. The paths are `internal`, `docs`
    //     and `''`, so that redirect matches nothing;
    //   - there is no sign-in page in this application at all - nothing calls AuthService.login - so there is no
    //     in-app place to send someone. A session is established on the legacy site and carried here by the cookie;
    //   - the data is not protected by this guard in any case. Every internal page reads the legacy API with
    //     `withCredentials`, and AuthService treats its not-logged-in response as signed out, so without a session
    //     the pages show nothing. The guard would change what a signed-out visitor sees, not what they can read;
    //   - and AuthService.state falls back to `loggedIn: false` on any error, so a transient legacy-API failure
    //     would bounce a signed-in user off pages they are entitled to. That is the risk to weigh.
    //
    // What a signed-out visitor sees today is an empty account page, which is its own fault; #3919 carries that
    // decision with the trade-off written down.
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.geoservicesInternalRoutes)
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
    importProvidersFrom(BrowserModule, Angulartics2Module.forRoot()),
    // The whole app's HttpClient, with the AuthInterceptor below. It used to arrive unannounced with ngx-highlightjs 6's
    // HighlightPlusModule, which imported HttpClientModule; 14's does not.
    provideHttpClient(withInterceptorsFromDi()),
    AuthService,
    provideAppInitializer(() => {
      // Start AuthService's login-state request at boot, as AppModule's constructor did.
      inject(AuthService);
      // RouterModule.forRoot's scrollOffset option, which provideRouter has no counterpart for.
      inject(ViewportScroller).setOffset([0, 64]);
    }),
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
      languages: getHighlightLanguages()
    }),
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
