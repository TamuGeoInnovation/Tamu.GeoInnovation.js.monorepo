import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { UIFormsModule } from '@tamu-gisc/ui-kits/ngx/forms';
import { UILayoutModule } from '@tamu-gisc/ui-kits/ngx/layout';

import { SponsorsDetailComponent } from './sponsors-detail.component';
import { DetailViewModule } from '../../../modules/detail-view/detail-view.module';

const routes: Routes = [
  {
    path: '',
    component: SponsorsDetailComponent
  }
];

@NgModule({
  declarations: [SponsorsDetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes), UIFormsModule, UILayoutModule, DetailViewModule],
  exports: [RouterModule]
})
export class SponsorsDetailModule {}
