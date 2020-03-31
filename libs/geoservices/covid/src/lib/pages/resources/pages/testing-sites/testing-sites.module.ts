import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { TestingSitesComponent } from './testing-sites.component';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';

const routes: Routes = [
  {
    path: '',
    component: TestingSitesComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), GeoservicesCoreNgxModule],
  declarations: [TestingSitesComponent]
})
export class TestingSitesModule {}
