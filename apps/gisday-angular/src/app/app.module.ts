import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FooterModule, HeaderModule } from '@tamu-gisc/gisday/angular';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/angular').then((m) => m.GISDayAngularModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), FooterModule, HeaderModule, EnvironmentModule, HttpClientModule],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
