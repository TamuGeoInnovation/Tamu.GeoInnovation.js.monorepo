import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';

import { AppComponent } from './app.component';

import { GeoservicesInternalModule } from '@tamu-gisc/geoservices/modules/internal';

const routes: Routes = [
  {
    path: '',
    component: AppComponent
  }
];

WebFont.load({
  google: {
    families: ['Material Icons', 'Ubuntu:300,400,500,600', 'Muli:300,400']
  }
});

@NgModule({
  imports: [BrowserModule, RouterModule.forRoot(routes), BrowserAnimationsModule, GeoservicesInternalModule],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
