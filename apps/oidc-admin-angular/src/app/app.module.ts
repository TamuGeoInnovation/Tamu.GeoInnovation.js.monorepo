import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';
import * as WebFont from 'webfontloader';
import { AuthModule, AuthInterceptor, AutoLoginPartialRoutesGuard, LogLevel } from 'angular-auth-oidc-client';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AuthenticationGuard, AuthRoutingModule } from '@tamu-gisc/oidc/ngx';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { NotificationModule, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: 'stats',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.StatsModule),
    canActivate: [AutoLoginPartialRoutesGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.UsersModule),
    canActivate: [AutoLoginPartialRoutesGuard, AuthenticationGuard]
  },
  {
    path: 'roles',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.RolesModule),
    canActivate: [AutoLoginPartialRoutesGuard, AuthenticationGuard]
  },
  {
    path: 'clients',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.ClientsModule),
    canActivate: [AutoLoginPartialRoutesGuard, AuthenticationGuard]
  },
  {
    path: 'authorization',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.AuthorizationModule),
    canActivate: [AutoLoginPartialRoutesGuard, AuthenticationGuard]
  }
];

WebFont.load({
  google: {
    families: ['Material Icons', 'Ubuntu:300,400,500,600', 'Muli:300,400']
  }
});

export function getHighlightLanguages() {
  return {
    xml: () => import('highlight.js/lib/languages/xml'),
    json: () => import('highlight.js/lib/languages/json'),
    javascript: () => import('highlight.js/lib/languages/javascript')
  };
}

@NgModule({
  imports: [
    Angulartics2Module.forRoot(),
    AuthModule.forRoot({
      config: {
        authority: environment.idp_url,
        redirectUrl: window.location.origin + '/auth/callback',
        secureRoutes: [environment.api_url],
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.client_id,
        scope: 'openid offline_access profile email',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: environment.production ? LogLevel.None : LogLevel.Debug,
        autoUserInfo: false
      }
    }),
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    BrowserAnimationsModule,
    EnvironmentModule,
    LocalStoreModule,
    NotificationModule,
    UILayoutModule,
    HttpClientModule,
    AuthRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
    NotificationService,
    {
      provide: env,
      useValue: environment
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
