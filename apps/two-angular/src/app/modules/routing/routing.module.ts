import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';

import * as environment from '../../../environments/environment';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans Pro', 'Oswald']
  }
});

const routes: Routes = [
  { path: '', loadChildren: () => import('../data-viewer/data-viewer.module').then((m) => m.DataViewerModule) }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', useHash: environment.environment.production }),
    EnvironmentModule
  ],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
