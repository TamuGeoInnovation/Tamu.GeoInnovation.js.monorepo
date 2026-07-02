import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AggiemapNgxCoreModule, EVENT_NOTIFICATION_DEFINITIONS } from '@tamu-gisc/aggiemap/ngx/core';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';
import { BUS_STOP_POPUP_COMPONENT } from '@tamu-gisc/maps/feature/trip-planner';
import { BusStopPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

import * as WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

@NgModule({
  imports: [
    Angulartics2Module.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    EnvironmentModule,
    NotificationModule,
    AggiemapNgxCoreModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'aggiemap-notifications' },
    { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: EventDefinitions },
    // Supplies the bus map's stop/route popup at the application root (BusService lives in a low-level
    // lib and cannot import the popup component directly — see BUS_STOP_POPUP_COMPONENT).
    { provide: BUS_STOP_POPUP_COMPONENT, useValue: BusStopPopupComponent }
  ]
})
export class AppModule {}
