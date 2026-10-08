import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import {
  notificationStorage,
  AGGIEMAP_NOTIFICATION_STORE_KEY,
  NotificationModule,
  NotificationGroupedModule
} from '@tamu-gisc/common/ngx/ui/notification';
import { EVENT_NOTIFICATION_DEFINITIONS, AggiemapNgxCoreModule, CodeMaroonAlertModule } from '@tamu-gisc/aggiemap/ngx/core';
import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';
import { BUS_STOP_POPUP_COMPONENT } from '@tamu-gisc/maps/feature/trip-planner';
import { BusStopPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { Angulartics2Module } from 'angulartics2';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(
      Angulartics2Module.forRoot(),
      BrowserModule,
      BrowserAnimationsModule,
      EnvironmentModule,
      NotificationModule,
      NotificationGroupedModule,
      AggiemapNgxCoreModule,
      // Code Maroon proof of concept (#1289). Development only; renders nothing elsewhere.
      CodeMaroonAlertModule
    ),
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: AGGIEMAP_NOTIFICATION_STORE_KEY },
    { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: EventDefinitions },
    // Supplies the bus map's stop/route popup at the application root (BusService lives in a low-level
    // lib and cannot import the popup component directly — see BUS_STOP_POPUP_COMPONENT).
    { provide: BUS_STOP_POPUP_COMPONENT, useValue: BusStopPopupComponent },
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ]
}).catch((err) => console.error(err));
