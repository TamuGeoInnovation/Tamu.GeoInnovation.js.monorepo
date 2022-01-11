import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';
import { StorageServiceModule } from 'ngx-webstorage-service';

import { AppRoutingModule } from '@tamu-gisc/ues/operations/ngx';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

@NgModule({
  imports: [AppRoutingModule, Angulartics2Module.forRoot(), EnvironmentModule, NotificationModule, StorageServiceModule],
  declarations: [AppComponent],
  providers: [
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'ues-notifications' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
