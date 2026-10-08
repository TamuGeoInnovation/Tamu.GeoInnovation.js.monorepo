import { enableProdMode, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

import * as WebFont from 'webfontloader';
import * as environment from './environments/environment';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { notificationStorage, NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { AppRoutingModule } from '@tamu-gisc/ues/operations/ngx';
import { Angulartics2Module } from 'angulartics2';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';

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
    importProvidersFrom(
      AppRoutingModule,
      Angulartics2Module.forRoot(),
      EnvironmentModule,
      NotificationModule,
      StorageServiceModule
    ),
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'ues-notifications' }
  ]
}).catch((err) => console.error(err));
