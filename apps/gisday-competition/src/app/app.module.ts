import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './modules/routing/routing.module';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import * as environment from '../environments/environment';

import { AppComponent } from './app.component';
import { UINavigationMobileTabModule } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, EnvironmentModule, UINavigationMobileTabModule],
  providers: [{ provide: env, useValue: environment }],
  bootstrap: [AppComponent]
})
export class AppModule {}
