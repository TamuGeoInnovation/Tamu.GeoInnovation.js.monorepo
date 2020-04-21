import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { TestingSitesComponent } from './testing-sites.component';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { GeoservicesCoreNgxModule } from '@tamu-gisc/geoservices/core/ngx';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

const routes: Routes = [
  {
    path: '',
    component: TestingSitesComponent
  },
  {
    path: 'create',
    loadChildren: () => import('./pages/create/create.module').then((m) => m.CreateModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule, GeoservicesCoreNgxModule],
  declarations: [TestingSitesComponent]
})
export class TestingSitesModule {}
