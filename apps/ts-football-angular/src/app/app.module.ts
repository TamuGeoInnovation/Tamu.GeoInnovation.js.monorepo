import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { TsFootballNgxModule } from '@tamu-gisc/ts/football/ngx';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald']
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
    TsFootballNgxModule,
    RouterModule.forRoot([])
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: env,
      useValue: environment
    },
    { provide: notificationStorage, useValue: 'football-notifications' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
