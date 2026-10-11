import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

// Services

import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

import { AuthModule } from '@tamu-gisc/ues/common/ngx';

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    loadChildren: () => import('../map/map.routes').then((m) => m.mapRoutes)
  }
];

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot(hybridRoutes, { initialNavigation: 'enabledBlocking' }),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CommonNgxRouterModule,
    TestingModule,
    AuthModule
  ],
  providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())]
})
export class AppRoutingModule {}
