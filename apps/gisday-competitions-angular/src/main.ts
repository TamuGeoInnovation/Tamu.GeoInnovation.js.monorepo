import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';
import * as environment from './environments/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { env } from '@tamu-gisc/common/ngx/environment';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Angulartics2Module } from 'angulartics2';
import { ServiceWorkerModule } from '@angular/service-worker';
import { gisdayCompetitionsRoutes } from '@tamu-gisc/gisday/competitions/ngx/core';
import { AppComponent } from './app/app.component';

if (environment.environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald:300,400']
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
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production })
    ),
    provideRouter(gisdayCompetitionsRoutes),
    NotificationService,
    { provide: env, useValue: environment },
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ]
}).catch((err) => console.error(err));
