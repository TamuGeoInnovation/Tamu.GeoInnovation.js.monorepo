import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as WebFont from 'webfontloader';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import * as environment from '../environments/environment';

import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Public Sans:300,400']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/map/map.module').then((m) => m.MapModule)
  }
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    EnvironmentModule
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
