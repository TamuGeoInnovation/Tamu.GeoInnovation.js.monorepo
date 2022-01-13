import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import * as WebFont from 'webfontloader';

import { ServiceWorkerModule } from '@angular/service-worker';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NotificationModule, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { GisdayCompetitionsNgxCoreModule } from '@tamu-gisc/gisday/competitions/ngx/core';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald:300,400']
  }
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production }),
    EnvironmentModule,
    NotificationModule,
    ResponsiveModule,
    SettingsModule,
    GisdayCompetitionsNgxCoreModule
  ],
  providers: [NotificationService, { provide: env, useValue: environment }],
  bootstrap: [AppComponent]
})
export class AppModule {}
