import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import * as WebFont from 'webfontloader';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { AuthService, AuthInterceptor } from '@tamu-gisc/geoservices/data-access';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import { AppComponent } from './app.component';
import * as environment from '../environments/environment';

const routes: Routes = [
  {
    path: 'public',
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.GeoservicesPublicModule)
  },
  {
    path: 'internal',
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.GeoservicesInternalModule)
    // canActivateChild: [AuthGuard]
  },
  {
    path: 'api',
    loadChildren: () => import('@tamu-gisc/geoservices/ngx').then((m) => m.GeoservicesApiModule)
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
    LocalStoreModule
  ],
  declarations: [AppComponent],
  providers: [
    AuthService,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'),
        languages: getHighlightLanguages()
      }
    },
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
