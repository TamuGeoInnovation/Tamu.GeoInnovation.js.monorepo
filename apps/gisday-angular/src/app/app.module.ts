import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FooterModule, HeaderModule } from '@tamu-gisc/gisday/angular';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/angular').then((m) => m.GISDayAngularModule)
  }
  // {
  //   path: 'users',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.UsersModule)
  // },
  // {
  //   path: 'roles',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.RolesModule)
  // },
  // {
  //   path: 'client-metadata',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.ClientMetadataModule)
  // },
  // {
  //   path: 'grant-types',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.GrantTypesModule)
  // },
  // {
  //   path: 'response-types',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.ResponseTypesModule)
  // },
  // {
  //   path: 'token-auth-methods',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.TokenAuthMethodsModule)
  // },
  // {
  //   path: 'access',
  //   loadChildren: () => import('@tamu-gisc/oidc/admin').then((m) => m.AccessTokenModule)
  // }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), FooterModule, HeaderModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
