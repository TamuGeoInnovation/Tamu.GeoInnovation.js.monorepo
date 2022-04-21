import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import * as WebFont from 'webfontloader';
import { env, EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AuthGuard, AuthInterceptorProvider } from '@tamu-gisc/common/ngx/auth';
import { NotificationModule, notificationStorage } from '@tamu-gisc/common/ngx/ui/notification';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';
import { Angulartics2Module } from 'angulartics2';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:300,400,600', 'Oswald:200,300,400,500']
  }
});

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/ues/cold-water/ngx').then((m) => m.MapModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabled' }),
    Angulartics2Module.forRoot(),
    HttpClientModule,
    NotificationModule
  ],
  providers: [
    EnvironmentService,
    {
      provide: env,
      useValue: environment
    },
    AuthInterceptorProvider,
    {
      provide: notificationStorage,
      useValue: 'aggiemap-notifications'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
