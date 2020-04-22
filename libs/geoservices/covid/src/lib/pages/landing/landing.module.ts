import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { LandingComponent } from './landing.component';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';


const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UILayoutModule, GeoservicesCoreNgxModule],
  declarations: [LandingComponent]
})
export class LandingModule {}
