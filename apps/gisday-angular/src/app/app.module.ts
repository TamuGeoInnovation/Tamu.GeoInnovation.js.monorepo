import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';
import { AuthModule, AuthGuard, AuthHttpInterceptor } from '@auth0/auth0-angular';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AdminGuard } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GisdayPlatformNgxCommonModule } from '@tamu-gisc/gisday/platform/ngx/common';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

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
    path: 'presenters',
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
    canActivate: [AuthGuard],
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.AccountModule)
  },
  {
    path: 'login',
    canActivate: [AuthGuard],
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LoginModule)
  },
  {
    path: 'logout',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.LogoutModule)
  },
  {
    path: 'forbidden',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.NotAuthedModule)
  },
  {
    path: 'callback',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.CallbackModule)
  }
];

const routeOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};

@NgModule({
  imports: [
    AuthModule.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.client_id,
      authorizationParams: {
        audience: environment.auth0.audience,
        redirect_uri: environment.auth0.redirect_uri
      },
      httpInterceptor: {
        allowedList: [
          {
            allowAnonymous: true,
            uri: `http://localhost:3333/api/*`
          }
        ]
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
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
