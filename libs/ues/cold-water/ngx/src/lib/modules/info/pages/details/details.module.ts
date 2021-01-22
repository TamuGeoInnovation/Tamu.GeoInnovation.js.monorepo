import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DetailsComponent } from './details.component';
import { ValveCommonModule } from '../../../common/common.module';

const routes: Routes = [
  {
    path: '',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ValveCommonModule],
  declarations: [DetailsComponent]
})
export class DetailsModule {}
