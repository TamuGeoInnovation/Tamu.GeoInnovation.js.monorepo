import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import * as WebFont from 'webfontloader';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AuthGuard, AuthService, AuthInterceptor } from '@tamu-gisc/geoservices/data-access';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: 'stats',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.StatsModule)
  },
  {
    path: 'users',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.UsersModule)
  },
  {
    path: 'roles',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.RolesModule)
  },
  {
    path: 'client-metadata',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.ClientMetadataModule)
  },
  {
    path: 'grant-types',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.GrantTypesModule)
  },
  {
    path: 'response-types',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.ResponseTypesModule)
  },
  {
    path: 'token-auth-methods',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.TokenAuthMethodsModule)
  },
  {
    path: 'access',
    loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.AccessTokenModule)
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
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    BrowserAnimationsModule,
    HighlightPlusModule,
    EnvironmentModule,
    LocalStoreModule,
    UILayoutModule
  ],
  declarations: [AppComponent],
  providers: [
    // AuthService,
    // {
    //   provide: HIGHLIGHT_OPTIONS,
    //   useValue: {
    //     languages: getHighlightLanguages(),
    //     lineNumbers: true
    //   }
    // },
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
