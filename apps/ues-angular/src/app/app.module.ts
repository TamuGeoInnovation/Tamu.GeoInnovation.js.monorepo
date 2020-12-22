import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import * as WebFont from 'webfontloader';
import { SESSION_STORAGE, LOCAL_STORAGE, StorageServiceModule } from 'ngx-webstorage-service';

import { AppRoutingModule } from '@tamu-gisc/ues/common/ngx';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons']
  },
  custom: {
    families: ['Moriston', 'Tungsten'],
    urls: ['assets/fonts/moriston_pro/moriston_pro.css', 'assets/fonts/tungsten/tungsten.css']
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
