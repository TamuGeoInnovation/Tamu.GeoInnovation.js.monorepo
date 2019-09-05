import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppRoutingModule } from './modules/routing/app-routing.module';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';

import * as environment from '../environments/environment';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';

@NgModule({
  imports: [AppRoutingModule, Angulartics2Module.forRoot(), EnvironmentModule, NotificationModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [{ provide: env, useValue: environment }]
})
export class AppModule {}
