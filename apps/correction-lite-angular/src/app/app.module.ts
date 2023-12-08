import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { CorrectionNgxModule } from '@tamu-gisc/correction/ngx';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

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
    HttpClientModule,
    RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
    CorrectionNgxModule,
    EnvironmentModule
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
