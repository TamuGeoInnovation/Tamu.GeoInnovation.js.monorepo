import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AuthGuard, AuthService } from '@tamu-gisc/geoservices/modules/data-access';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'internal'
  },
  {
    path: 'internal',
    loadChildren: () => import('@tamu-gisc/geoservices/modules/internal').then((m) => m.GeoservicesInternalModule),
    canActivateChild: [AuthGuard]
  },
  {
    path: 'api',
    loadChildren: () => import('@tamu-gisc/geoservices/modules/api').then((m) => m.GeoservicesApiModule)
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
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
    BrowserAnimationsModule,
    HighlightPlusModule,
    EnvironmentModule
  ],
  declarations: [AppComponent],
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
