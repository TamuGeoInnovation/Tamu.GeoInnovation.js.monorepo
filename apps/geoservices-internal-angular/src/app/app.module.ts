import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'internal'
  },
  {
    path: 'internal',
    loadChildren: () => import('@tamu-gisc/geoservices/modules/internal').then((m) => m.GeoservicesInternalModule)
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

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(routes), BrowserAnimationsModule],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
