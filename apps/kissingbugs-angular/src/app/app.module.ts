import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Public Sans:300,400,500,600']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.HomeModule)
  }
];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    EnvironmentModule
  ],
  declarations: [AppComponent],
  providers: [
    Title,
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
