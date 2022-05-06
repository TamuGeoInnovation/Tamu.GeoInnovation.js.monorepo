import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';
import { Angulartics2Module } from 'angulartics2';
import { AuthModule, AutoLoginPartialRoutesGuard, LogLevel } from 'angular-auth-oidc-client';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { AuthRoutingModule } from '@tamu-gisc/oidc/ngx';

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
    loadChildren: () => import('@tamu-gisc/cpa/ngx/admin').then((m) => m.CpaNgxAdminModule),
    canLoad: [AutoLoginPartialRoutesGuard]
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
    AuthModule.forRoot({
      config: {
        authority: environment.idp_url,
        redirectUrl: window.location.origin + '/auth/callback',
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.idp_client_id,
        scope: 'openid offline_access profile email',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: environment.environment.production ? LogLevel.None : LogLevel.Debug,
        autoUserInfo: false
      }
    }),
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    AuthRoutingModule,
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
