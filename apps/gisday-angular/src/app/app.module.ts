import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';

import * as WebFont from 'webfontloader';
import { AuthModule, AuthHttpInterceptor } from '@auth0/auth0-angular';
import { Angulartics2Module } from 'angulartics2';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { ROLES_CLAIM } from '@tamu-gisc/common/ngx/auth';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:400,600,700', 'Source Sans Pro:200,400,600,800']
  }
});

const routes: Routes = [
  {
    path: 'app',
    loadChildren: () => import('@tamu-gisc/gisday/competitions/ngx/core').then((m) => m.PublicModule)
  },
  {
    path: 'callback',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.CallbackModule)
  },
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/platform/ngx/core').then((m) => m.WrapperModule)
  }
];

const routeOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};

@NgModule({
  imports: [
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production }),
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
            uriMatcher: (url) => {
              // Type assertion because the static value is a token replaced at runtime
              return (environment.auth0.urls as unknown as Array<string>).some((u) => url.startsWith(u));
            }
          }
        ]
      }
    }),
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, routeOptions),
    EnvironmentModule,
    HttpClientModule,
    NotificationModule,
    FormsModule,
    ReactiveFormsModule
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
    },
    {
      provide: ROLES_CLAIM,
      useValue: environment.auth0.roles_claim
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
