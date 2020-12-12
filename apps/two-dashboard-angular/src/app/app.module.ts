import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/two/dashboard').then((m) => m.DashboardModule)
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
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    BrowserAnimationsModule,
    EnvironmentModule,
    LocalStoreModule
  ],
  providers: [
    AuthService,
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private auth: AuthService) {}
}
