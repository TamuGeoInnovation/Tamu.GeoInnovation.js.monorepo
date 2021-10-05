import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';
import { Angulartics2Module } from 'angulartics2';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Lato:400,700,400italic', 'Open+Sans:600italic,600,400,400italic,300,300italic']
  }
});

const routes: Routes = [
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.HomeModule)
  },
  {
    path: 'found-a-bug',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.FoundABugModule)
  },
  {
    path: 'map',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.MapModule)
  },
  {
    path: 'team',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.TeamModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.FaqModule)
  },
  {
    path: 'resources',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.ResourcesModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('@tamu-gisc/kissingbugs/ngx').then((m) => m.ContactModule)
  }
];

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 64]
    }),
    EnvironmentModule,
    Angulartics2Module.forRoot()
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
export class AppModule {}
