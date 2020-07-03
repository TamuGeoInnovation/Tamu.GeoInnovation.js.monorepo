import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppRoutingModule } from '@tamu-gisc/ues/common/ngx';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';

import * as environment from '../environments/environment';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';

@NgModule({
  imports: [AppRoutingModule, Angulartics2Module.forRoot(), EnvironmentModule, NotificationModule],
  declarations: [AppComponent],
  providers: [{ provide: env, useValue: environment }, { provide: notificationStorage, useValue: 'ues-notifications' }],
  bootstrap: [AppComponent]
})
export class AppModule {}
