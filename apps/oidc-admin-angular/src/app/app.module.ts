import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AuthService } from '@tamu-gisc/geoservices/data-access';
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
    EnvironmentModule,
    LocalStoreModule,
    UILayoutModule
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
