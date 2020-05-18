import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { LocalStoreModule } from '@tamu-gisc/common/ngx/local-store';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from '@tamu-gisc/geoservices/data-access';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@tamu-gisc/two/dashboard').then((m) => m.DashboardModule)
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'corrected' }),
    BrowserAnimationsModule,
    HighlightPlusModule,
    // EnvironmentModule,
    LocalStoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private auth: AuthService) {}
}
