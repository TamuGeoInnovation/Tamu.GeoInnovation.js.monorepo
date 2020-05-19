import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { StatusComponent } from './status.component';

const routes: Routes = [
  {
    path: '',
    component: StatusComponent
  }
];

@NgModule({
  declarations: [StatusComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UILayoutModule,
    GeoservicesCoreNgxModule, 
  ]
})
export class StatusModule { }
