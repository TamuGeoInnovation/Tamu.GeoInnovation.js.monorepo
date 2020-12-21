import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { NotificationModule } from '@tamu-gisc/common/ngx/ui/notification';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import * as environment from '../environments/environment';

import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Public Sans:300,400,500,600']
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
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', relativeLinkResolution: 'legacy' }),
    EnvironmentModule,
    LocalStoreModule,
    NotificationModule
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
