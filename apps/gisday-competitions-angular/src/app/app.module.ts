import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppRoutingModule } from './modules/routing/routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import * as environment from '../environments/environment';
import { NotificationModule, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { AppComponent } from './app.component';
import { UINavigationMobileTabModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production }),
    EnvironmentModule,
    UINavigationMobileTabModule,
    NotificationModule
  ],
  providers: [NotificationService, { provide: env, useValue: environment }],
  bootstrap: [AppComponent]
})
export class AppModule {}
