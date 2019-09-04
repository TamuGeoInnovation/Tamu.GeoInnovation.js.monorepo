import { NgModule } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { AppRoutingModule } from './modules/routing/app-routing.module';

import { Sources } from '@tamu-gisc/search';
import { NotificationModule, NotificationEvents } from '@tamu-gisc/common/ngx/ui/notification';

import { EVENTS, SearchSources } from '../environments/environment';

import { env } from '@tamu-gisc/common/ngx/ditokens';
import * as environment from '../environments/environment';

import { AppComponent } from './app.component';

@NgModule({
  imports: [AppRoutingModule, Angulartics2Module.forRoot(), NotificationModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    { provide: NotificationEvents, useValue: EVENTS },
    { provide: Sources, useValue: SearchSources },
    { provide: env, useValue: environment }
  ]
})
export class AppModule {}
