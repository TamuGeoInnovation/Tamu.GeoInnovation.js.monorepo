import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { UITamuBrandingModule } from '@tamu-gisc/ui-kits/ngx/branding';

// Services
import { ResponsiveModule } from '@tamu-gisc/dev-tools/responsive';
import { CommonNgxRouterModule } from '@tamu-gisc/common/ngx/router';
import { TestingModule } from '@tamu-gisc/dev-tools/application-testing';

const hybridRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'map'
  },
  {
    path: 'map',
    loadChildren: () => import('../map/map.module').then((m) => m.MapModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(hybridRoutes, { initialNavigation: 'enabled' }),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ResponsiveModule,
    CommonNgxRouterModule,
    TestingModule,
    UITamuBrandingModule
  ],
  declarations: [],
  providers: [],
  exports: [RouterModule]
})
export class AppRoutingModule {}
