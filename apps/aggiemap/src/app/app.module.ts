import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppRoutingModule } from './modules/routing/app-routing.module';

import { Sources } from '@tamu-gisc/search';
import { NotificationModule, NotificationEvents } from '@tamu-gisc/common/ngx/ui/notification';

import { EVENTS, SearchSources } from '../environments/environment';

import { AppComponent } from './app.component';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

@NgModule({
  imports: [AppRoutingModule, Angulartics2Module.forRoot(), NotificationModule, TestingModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [{ provide: NotificationEvents, useValue: EVENTS }, { provide: Sources, useValue: SearchSources }]
})
export class AppModule {}
