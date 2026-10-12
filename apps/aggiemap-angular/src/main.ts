import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';

import * as environment from './environments/environment';
import { env } from '@tamu-gisc/common/ngx/environment';
import { notificationStorage, AGGIEMAP_NOTIFICATION_STORE_KEY } from '@tamu-gisc/common/ngx/ui/notification';
import { EVENT_NOTIFICATION_DEFINITIONS, aggiemapRoutes } from '@tamu-gisc/aggiemap/ngx/core';
import { BUS_STOP_POPUP_COMPONENT } from '@tamu-gisc/maps/feature/trip-planner';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { Angulartics2Module } from 'angulartics2';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(Angulartics2Module.forRoot(), BrowserModule, BrowserAnimationsModule),
    provideRouter(aggiemapRoutes),
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: AGGIEMAP_NOTIFICATION_STORE_KEY },
    // Loaded after startup, not with it: every event map's definition is a large download that the
    // first paint does not need (#1454).
    {
      provide: EVENT_NOTIFICATION_DEFINITIONS,
      useValue: () => import('@tamu-gisc/ts/events/ngx').then((m) => m.EventDefinitions)
    },
    // Supplies the bus map's stop/route popup at the application root (BusService lives in a low-level
    // lib and cannot import the popup component directly — see BUS_STOP_POPUP_COMPONENT).
    { provide: BUS_STOP_POPUP_COMPONENT, useValue: Popups.BusStopPopupComponent },
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ]
}).catch((err) => console.error(err));
