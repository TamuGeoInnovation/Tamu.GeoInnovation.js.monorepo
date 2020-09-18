import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FooterModule, HeaderModule } from '@tamu-gisc/gisday/angular';

import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/gisday/angular').then((m) => m.GISDayAngularModule)
  },
  {
    path: 'sessions',
    loadChildren: () => import('@tamu-gisc/gisday/angular').then((m) => m.SessionsModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('@tamu-gisc/gisday/angular').then((m) => m.SessionsModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), FooterModule, HeaderModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
