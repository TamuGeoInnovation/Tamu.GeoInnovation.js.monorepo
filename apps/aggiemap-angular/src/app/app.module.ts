import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';

import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { AggiemapNgxCoreModule, EVENT_NOTIFICATION_DEFINITIONS } from '@tamu-gisc/aggiemap/ngx/core';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { EventDefinitions } from '@tamu-gisc/ts/events/ngx';

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
    { provide: EVENT_NOTIFICATION_DEFINITIONS, useValue: EventDefinitions }
  ]
})
export class AppModule {}
