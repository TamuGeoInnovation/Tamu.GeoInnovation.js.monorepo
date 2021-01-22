import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/ues/cold-water/ngx').then((m) => m.MapModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes, { initialNavigation: 'enabled' }), HttpClientModule],
  providers: [
    EnvironmentService,
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
