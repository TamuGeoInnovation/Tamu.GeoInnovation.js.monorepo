import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { TsRingdayNgxModule } from '@tamu-gisc/ts/ringday/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import {
  NotificationModule,
  notificationStorage,
  AGGIEMAP_NOTIFICATION_STORE_KEY
} from '@tamu-gisc/common/ngx/ui/notification';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald']
  }
});

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    Angulartics2Module.forRoot(),
    EnvironmentModule,
    SettingsModule,
    NotificationModule,
    TsRingdayNgxModule,
    RouterModule.forRoot([])
  ],
  providers: [
    {
      provide: env,
      useValue: environment
    },
    { provide: notificationStorage, useValue: AGGIEMAP_NOTIFICATION_STORE_KEY },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {}
