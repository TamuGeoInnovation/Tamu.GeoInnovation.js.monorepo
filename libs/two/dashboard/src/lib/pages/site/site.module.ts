import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { SiteComponent } from './site.component';

const routes: Routes = [
  {
    path: '',
    component: SiteComponent
  }
];

@NgModule({
  declarations: [SiteComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UILayoutModule,
    GeoservicesCoreNgxModule, 
  ]
})
export class SiteModule { }
