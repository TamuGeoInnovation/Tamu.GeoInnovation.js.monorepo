import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { GisdayNgxModule, LoginGuard, AdminGuard } from '@tamu-gisc/gisday/ngx';

import { AuthInterceptor, AuthService } from '@tamu-gisc/gisday/data-access';

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
    path: 'presenters',
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.PresentersModule)
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
    path: 'admin',
    // canActivate: [AdminGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.AdminModule)
  },
  {
    path: 'account',
    canActivate: [LoginGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.AccountModule),
    data: {
      externalUrl: 'http://localhost:3333/oidc/login'
    }
  },
  {
    path: 'login',
    canActivate: [LoginGuard],
    loadChildren: () => import('@tamu-gisc/gisday/ngx').then((m) => m.LoginModule),
    data: {
      externalUrl: 'http://localhost:3333/oidc/login'
    }
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), GisdayNgxModule, EnvironmentModule, HttpClientModule],
  providers: [
    {
      provide: env,
      useValue: environment
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private auth: AuthService) {}
}
