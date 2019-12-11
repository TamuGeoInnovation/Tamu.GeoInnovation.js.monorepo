import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import * as WebFont from 'webfontloader';

import * as environment from '../../../environments/environment';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../map/map.module').then((m) => m.MapModule)
  }
];

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans Pro', 'Oswald']
  }
});

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    HttpClientModule,
    EnvironmentModule
  ],
  declarations: [],
  providers: [
    {
      provide: env,
      useValue: environment
    }
  ],
  exports: [RouterModule]
})
export class RoutingModule {}
