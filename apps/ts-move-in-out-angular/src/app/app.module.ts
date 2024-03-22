import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { TsMoveinNgxModule } from '@tamu-gisc/ts/movein/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

import * as WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

@NgModule({
  imports: [BrowserModule, HttpClientModule, EnvironmentModule, SettingsModule, TsMoveinNgxModule],
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
