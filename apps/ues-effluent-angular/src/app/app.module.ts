import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';
import { SESSION_STORAGE, LOCAL_STORAGE, StorageServiceModule } from 'angular-webstorage-service';

import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { AuthGuard, AuthService, AuthInterceptor } from '@tamu-gisc/geoservices/data-access';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons']
  },
  custom: {
    families: ['Moriston', 'Tungsten'],
    urls: ['assets/fonts/moriston_pro/moriston_pro.css', 'assets/fonts/tungsten/tungsten.css']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/ues/effluent/ngx').then((m) => m.MapModule)
  },
  {
    path: 'data',
    loadChildren: () => import('@tamu-gisc/ues/effluent/ngx').then((m) => m.DataModule)
  }
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    Angulartics2Module.forRoot(),
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    HttpClientModule,
    EnvironmentModule,
    NotificationModule,
    StorageServiceModule,
    CommonNgxRouterModule
  ],
  declarations: [AppComponent],
  providers: [
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'ues-effluent-notifications' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
