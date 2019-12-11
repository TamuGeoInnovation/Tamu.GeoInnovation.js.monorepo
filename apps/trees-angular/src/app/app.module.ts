import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './modules/routing/routing.module';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import * as environment from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, EnvironmentModule],
  providers: [{ provide: env, useValue: environment }],
  bootstrap: [AppComponent]
})
export class AppModule {}
