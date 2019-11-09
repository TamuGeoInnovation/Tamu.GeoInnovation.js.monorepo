import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './modules/routing/routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import * as environment from '../environments/environment';

import { AppComponent } from './app.component';
import { UINavigationMobileTabModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production }),
    EnvironmentModule,
    UINavigationMobileTabModule
  ],
  providers: [{ provide: env, useValue: environment }],
  bootstrap: [AppComponent]
})
export class AppModule {}
