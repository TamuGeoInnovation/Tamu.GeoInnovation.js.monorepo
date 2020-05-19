import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import * as WebFont from 'webfontloader';

import { AppComponent } from './app.component';
import { AuthService } from '@tamu-gisc/geoservices/data-access';
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
    HighlightPlusModule,
    EnvironmentModule,
    LocalStoreModule
  ],
  providers: [
    AuthService,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        languages: getHighlightLanguages(),
        lineNumbers: true
      }
    },
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
