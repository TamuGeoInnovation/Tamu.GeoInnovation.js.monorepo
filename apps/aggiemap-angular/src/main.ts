import { enableProdMode, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';

import * as environment from './environments/environment';
import { env } from '@tamu-gisc/common/ngx/environment';
import { ACTING_AS_PRODUCTION } from '@tamu-gisc/dev-tools/application-testing';
import { actingAsProduction } from '@tamu-gisc/aggiemap/ngx/common';
import { notificationStorage, AGGIEMAP_NOTIFICATION_STORE_KEY } from '@tamu-gisc/common/ngx/ui/notification';
import { EVENT_NOTIFICATION_DEFINITIONS, aggiemapRoutes } from '@tamu-gisc/aggiemap/ngx/core';
import { BUS_STOP_POPUP_COMPONENT } from '@tamu-gisc/maps/feature/trip-planner';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { Angulartics2Module } from 'angulartics2';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';

if (environment.environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: [
      'Material Icons',
      'Material Icons Outlined',
      'Open Sans:300,400,600,700,800',
      'Oswald:200,300,400,500,600,700'
    ]
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    // No Zone.js (#1478): Angular checks a view only when a signal it reads changes, an input or a
    // template event marks it, or markForCheck is called, so ArcGIS's many events no longer each start
    // a pass. Zoneless is already Angular 21's default; it is named here so nobody reads its absence
    // as an oversight. The other apps still load zone.js and keep provideZoneChangeDetection().
    provideZonelessChangeDetection(),
    // Zone.js handed an error thrown in a timer, a promise or an ArcGIS callback to Angular's
    // ErrorHandler, which logs it as "ERROR ...". Without a zone it would go straight to the browser as
    // an uncaught error; these listeners keep it going through the ErrorHandler.
    provideBrowserGlobalErrorListeners(),
    // No animations provider: AggieMap's sliding pieces are CSS transitions (libs/sass/motion), not @angular/animations
    // triggers, which Angular 22 deprecates (#1218).
    importProvidersFrom(Angulartics2Module.forRoot(), BrowserModule),
    provideRouter(aggiemapRoutes),
    { provide: env, useValue: environment },
    // `?as=production` makes a development host behave as production, for the tab (#1722).
    { provide: ACTING_AS_PRODUCTION, useFactory: () => actingAsProduction() },
    { provide: notificationStorage, useValue: AGGIEMAP_NOTIFICATION_STORE_KEY },
    // Loaded after startup, not with it: every event map's definition is a large download that the
    // first paint does not need (#1454).
    {
      provide: EVENT_NOTIFICATION_DEFINITIONS,
      useValue: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.EventDefinitions)
    },
    // Supplies the bus map's stop/route popup at the application root (BusService lives in a low-level
    // lib and cannot import the popup component directly - see BUS_STOP_POPUP_COMPONENT).
    { provide: BUS_STOP_POPUP_COMPONENT, useValue: Popups.BusStopPopupComponent },
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ]
}).catch((err) => console.error(err));
