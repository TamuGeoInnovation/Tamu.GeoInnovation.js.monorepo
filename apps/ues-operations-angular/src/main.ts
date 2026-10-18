import { enableProdMode, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';

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
    // No Zone.js (#1478): Angular checks a view only when a signal it reads changes, an input or a
    // template event marks it, or markForCheck is called, so ArcGIS's many events no longer each start
    // a pass. Zoneless is already Angular 21's default; it is named here so nobody reads its absence
    // as an oversight. The other apps still load zone.js and keep provideZoneChangeDetection().
    provideZonelessChangeDetection(),
    importProvidersFrom(BrowserModule, BrowserAnimationsModule, Angulartics2Module.forRoot()),
    provideRouter(uesOperationsRoutes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'ues-notifications' }
  ]
}).catch((err) => console.error(err));
