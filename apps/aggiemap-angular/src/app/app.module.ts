import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AggiemapNgxCoreModule, CodeMaroonAlertModule, EVENT_NOTIFICATION_DEFINITIONS } from '@tamu-gisc/aggiemap/ngx/core';
import {
  NotificationGroupedModule,
  NotificationModule,
  notificationStorage,
  AGGIEMAP_NOTIFICATION_STORE_KEY
} from '@tamu-gisc/common/ngx/ui/notification';
import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';
import { BUS_STOP_POPUP_COMPONENT } from '@tamu-gisc/maps/feature/trip-planner';
import { BusStopPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

import * as WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600,700,800', 'Oswald:200,300,400,500,600,700']
  }
});

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [Angulartics2Module.forRoot(),
        BrowserModule,
        BrowserAnimationsModule,
        EnvironmentModule,
        NotificationModule,
        NotificationGroupedModule,
        AggiemapNgxCoreModule,
        // Code Maroon proof of concept (#1289). Development only; renders nothing elsewhere.
        CodeMaroonAlertModule], providers: [
        { provide: env, useValue: environment },
        { provide: notificationStorage, useValue: AGGIEMAP_NOTIFICATION_STORE_KEY },
        { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: EventDefinitions },
        // Supplies the bus map's stop/route popup at the application root (BusService lives in a low-level
        // lib and cannot import the popup component directly — see BUS_STOP_POPUP_COMPONENT).
        { provide: BUS_STOP_POPUP_COMPONENT, useValue: BusStopPopupComponent },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {}
