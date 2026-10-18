import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';
import * as environment from './environments/environment';
import { env } from '@tamu-gisc/common/ngx/environment';
import { notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { uesOperationsRoutes } from '@tamu-gisc/ues/operations/ngx';
import { Angulartics2Module } from 'angulartics2';
import { AppComponent } from './app/app.component';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';

if (environment.environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(BrowserModule, BrowserAnimationsModule, Angulartics2Module.forRoot()),
    provideRouter(uesOperationsRoutes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'ues-notifications' }
  ]
}).catch((err) => console.error(err));
