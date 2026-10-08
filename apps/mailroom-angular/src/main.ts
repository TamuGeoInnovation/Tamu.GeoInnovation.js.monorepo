import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';
import { environment } from './environments/environment';
import { NotificationService, NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { Angulartics2Module } from 'angulartics2';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { withInMemoryScrolling, provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/mailroom/ngx').then((m) => m.ListModule)
  }
];

if (environment.production) {
  enableProdMode();
}

WebFont.load({
  google: {
    families: ['Material Symbols', 'Material Symbols Outlined', 'Open Sans:300,400,600']
  }
});

bootstrapApplication(AppComponent, {
  providers: [
    // Every component still relies on Zone.js (ChangeDetectionStrategy.Eager); without this,
    // bootstrapApplication runs zoneless since Angular 21 (#1563, #1478).
    provideZoneChangeDetection(),
    importProvidersFrom(
      Angulartics2Module.forRoot(),
      BrowserModule,
      BrowserAnimationsModule,
      EnvironmentModule,
      NotificationModule
    ),
    NotificationService,
    {
      provide: env,
      useValue: environment
    },
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }))
  ]
}).catch((err) => console.error(err));
