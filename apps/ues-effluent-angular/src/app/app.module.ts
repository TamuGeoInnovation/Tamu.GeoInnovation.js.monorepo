import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';
import { StorageServiceModule } from 'ngx-webstorage-service';

import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';
import { env, EnvironmentModule } from '@tamu-gisc/common/ngx/environment';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { AuthGuard, AuthProvider } from '@tamu-gisc/common/ngx/auth';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';
WebFont.load({
  google: {
    families: ['Material Icons', 'Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/ues/effluent/ngx').then((m) => m.MapModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'data',
    loadChildren: () => import('@tamu-gisc/ues/effluent/ngx').then((m) => m.DataModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    Angulartics2Module.forRoot(),
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    EnvironmentModule,
    NotificationModule,
    StorageServiceModule,
    CommonNgxRouterModule
  ],
  declarations: [AppComponent],
  providers: [
    AuthProvider,
    { provide: env, useValue: environment },
    { provide: notificationStorage, useValue: 'ues-effluent-notifications' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
