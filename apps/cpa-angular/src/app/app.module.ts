import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';
import { Angulartics2Module } from 'angulartics2';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons Outlined', 'Public Sans:300,400,500,600']
  }
});

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('@tamu-gisc/cpa/ngx/admin').then((m) => m.CpaNgxAdminModule)
  },
  {
    path: 'viewer',
    loadChildren: () => import('@tamu-gisc/cpa/ngx/viewer').then((m) => m.CpaNgxViewerModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'viewer'
  }
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    EnvironmentModule,
    LocalStoreModule,
    NotificationModule,
    Angulartics2Module.forRoot()
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
