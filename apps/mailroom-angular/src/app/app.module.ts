import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { Angulartics2Module } from 'angulartics2';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { NotificationModule, NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/mailroom/ngx').then((m) => m.ListModule)
  }
];

@NgModule({
  imports: [
    Angulartics2Module.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    EnvironmentModule,
    NotificationModule,
    HttpClientModule
  ],
  declarations: [AppComponent],
  providers: [
    NotificationService,
    {
      provide: env,
      useValue: environment
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
