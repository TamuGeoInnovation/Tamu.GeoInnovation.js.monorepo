import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';
import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';

import { TestingSitesComponent } from './testing-sites.component';
import { CovidFormsModule } from '../../../../modules/forms/forms.module';

const routes: Routes = [
  {
    path: '',
    component: TestingSitesComponent
  },
  {
    path: 'create',
    loadChildren: () => import('./pages/create/create.module').then((m) => m.CreateModule)
  },
  {
    path: 'create/:siteGuid',
    loadChildren: () => import('./pages/create/create.module').then((m) => m.CreateModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule, CovidFormsModule],
  declarations: [TestingSitesComponent]
})
export class TestingSitesModule {}
