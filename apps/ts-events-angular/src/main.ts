import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';

import * as environment from './environments/environment';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import {
  notificationStorage,
  AGGIEMAP_NOTIFICATION_STORE_KEY,
  NotificationModule
} from '@tamu-gisc/common/ngx/ui/notification';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Angulartics2Module } from 'angulartics2';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';
import { TsEventsNgxModule } from '@tamu-gisc/ts/events/ngx';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';

if (environment.environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald']
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      Angulartics2Module.forRoot(),
      EnvironmentModule,
      SettingsModule,
      NotificationModule,
      TsEventsNgxModule
    ),
    {
      provide: env,
      useValue: environment
    },
    { provide: notificationStorage, useValue: AGGIEMAP_NOTIFICATION_STORE_KEY },
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideRouter([])
  ]
}).catch((err) => console.error(err));
