import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';
import { AuthModule, AutoLoginPartialRoutesGuard, LogLevel } from 'angular-auth-oidc-client';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AuthenticationGuard, AuthRoutingModule } from '@tamu-gisc/oidc/ngx';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: 'stats',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.StatsModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'users',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.UsersModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'roles',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.RolesModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'client-metadata',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.ClientMetadataModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'grant-types',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.GrantTypesModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'response-types',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.ResponseTypesModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'token-auth-methods',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.TokenAuthMethodsModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'access',
    loadChildren: () => import('@tamu-gisc/oidc/admin/ngx').then((m) => m.AccessTokenModule),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'login',
    component: AppComponent,
    canActivate: [AutoLoginPartialRoutesGuard]
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
    AuthModule.forRoot({
      config: {
        authority: environment.idp_url,
        redirectUrl: window.location.origin + '/auth/callback',
        postLogoutRedirectUri: window.location.origin,
        clientId: environment.client_id,
        scope: 'openid offline_access profile email',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: environment.environment.production ? LogLevel.None : LogLevel.Debug,
        autoUserInfo: false
      }
    }),
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    BrowserAnimationsModule,
    EnvironmentModule,
    LocalStoreModule,
    UILayoutModule,
    HttpClientModule,
    AuthRoutingModule
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
