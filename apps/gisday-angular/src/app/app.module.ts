import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

import { AuthModule, EventTypes, LogLevel, PublicEventsService } from 'angular-auth-oidc-client';
import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LoginGuard, LogoutGuard, AdminGuard } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment.dev';
import { filter } from 'rxjs';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:400,600,700', 'Source Sans Pro:200,400,600,800']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LandingModule)
  },
  {
    path: 'sessions',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.EventModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.FaqModule)
  },
  {
    path: 'sponsors',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.SponsorsModule)
  },
  {
    path: 'people',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.PeopleModule)
  },
  {
    path: 'about',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AboutModule)
  },
  {
    path: 'competitions',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.CompetitionsModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.ContactModule)
  },
  {
    path: 'highschool',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.HighschoolModule)
  },
  {
    path: 'wayback',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.WaybackModule)
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AdminModule)
  },
  {
    path: 'account',
    canActivate: [LoginGuard],
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AccountModule)
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LoginModule),
    data: {
      externalUrl: `${environment.api_url}/oidc/login`
    }
  },
  {
    path: 'logout',
    canActivate: [LogoutGuard],
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LogoutModule),
    data: {
      externalUrl: `${environment.api_url}/oidc/login`
    }
  }
];

const routeOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};

@NgModule({
  imports: [
    AuthModule.forRoot({
      config: {
        authority: environment.idp_url,
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        clientId: 'gisday',
        scope: 'openid offline_access profile email',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true,
        logLevel: LogLevel.Debug,
        autoUserInfo: false
      }
    }),
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, routeOptions),
    GisdayPlatformNgxCommonModule,
    EnvironmentModule,
    HttpClientModule
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
export class AppModule {
  constructor(private readonly eventService: PublicEventsService) {
    this.eventService
      .registerForEvents()
      .pipe(filter((notification) => notification.type === EventTypes.ConfigLoaded))
      .subscribe((config) => {
        console.log('ConfigLoaded', config);
      });
  }
}
