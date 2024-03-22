import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { TsMoveinNgxModule } from '@tamu-gisc/ts/movein/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600']
  }
});

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Angulartics2Module.forRoot(),
    EnvironmentModule,
    SettingsModule,
    NotificationModule,
    TsMoveinNgxModule
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: env,
      useValue: environment
    },
    { provide: notificationStorage, useValue: 'movein-notifications' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
