import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { GisdayNgxModule, LoginGuard, LogoutGuard, AdminGuard } from '@tamu-gisc/gisday/ngx';

import { AuthInterceptor, AuthService } from '@tamu-gisc/gisday/data-access';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:400,600,700', 'Source Sans Pro:200,400,600,800']
  }
});

// <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700|Material+Icons|Source+Sans+Pro:200,400,600,800" rel="stylesheet">

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.LandingModule)
  },
  {
    path: 'sessions',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.EventModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.FaqModule)
  },
  {
    path: 'sponsors',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.SponsorsModule)
  },
  {
    path: 'people',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.PeopleModule)
  },
  {
    path: 'about',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.AboutModule)
  },
  {
    path: 'competitions',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.CompetitionsModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.ContactModule)
  },
  {
    path: 'highschool',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.HighschoolModule)
  },
  {
    path: 'wayback',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.WaybackModule)
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.AdminModule)
  },
  {
    path: 'account',
    canActivate: [LoginGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.AccountModule)
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.LoginModule),
    data: {
      externalUrl: 'http://localhost:3333/oidc/login'
    }
  },
  {
    path: 'logout',
    canActivate: [LogoutGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.LogoutModule),
    data: {
      externalUrl: 'http://localhost:3333/oidc/logout'
    }
  }
];

const routeOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes, routeOptions), GisdayNgxModule, EnvironmentModule, HttpClientModule],
  providers: [
    {
      provide: env,
      useValue: environment
    }
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private auth: AuthService) {}
}
