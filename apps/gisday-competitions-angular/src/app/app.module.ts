import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import * as WebFont from 'webfontloader';

import { ServiceWorkerModule } from '@angular/service-worker';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NotificationModule, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { SettingsModule } from '@tamu-gisc/common/ngx/settings';

import * as environment from '../environments/environment';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './modules/guards/auth.guard';

WebFont.load({
  google: {
    families: ['Material Icons', 'Open Sans:300,400,600', 'Oswald:300,400']
  }
});

const routes: Routes = [
  {
    path: 'designer',
    loadChildren: () => import('./pages/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    loadChildren: () => import('./pages/public/public.module').then((m) => m.PublicModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.environment.production }),
    EnvironmentModule,
    NotificationModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    SettingsModule
  ],
  providers: [NotificationService, { provide: env, useValue: environment }, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {}
