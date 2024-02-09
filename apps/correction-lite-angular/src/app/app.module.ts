import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { Angulartics2Module } from 'angulartics2';

import { CorrectionNgxModule } from '@tamu-gisc/correction/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

import * as WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Symbols Outlined', 'Open Sans:300,400,600']
  }
});

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
    Angulartics2Module.forRoot(),
    CorrectionNgxModule,
    EnvironmentModule,
    NotificationModule
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
