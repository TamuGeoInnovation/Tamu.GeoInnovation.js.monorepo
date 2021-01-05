import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import * as WebFont from 'webfontloader';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import * as environment from '../environments/environment';

import { AppComponent } from './app.component';

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
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      [
        {
          path: 'data',
          loadChildren: () => import('@tamu-gisc/ues/recycling/ngx').then((m) => m.DataModule)
        },
        {
          path: '',
          loadChildren: () => import('@tamu-gisc/ues/recycling/ngx').then((m) => m.MapModule)
        }
      ],
      { initialNavigation: 'enabled' }
    )
  ],
  providers: [
    EnvironmentService,
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
