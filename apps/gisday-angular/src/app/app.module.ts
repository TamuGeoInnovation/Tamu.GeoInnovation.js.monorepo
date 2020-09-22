import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { GisdayNgxModule } from '@tamu-gisc/gisday/ngx';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.LandingModule)
  },
  {
    path: 'sessions',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.SessionsModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.FaqModule)
  },
  {
    path: 'sponsors',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.SponsorsModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), GisdayNgxModule, EnvironmentModule, HttpClientModule],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
