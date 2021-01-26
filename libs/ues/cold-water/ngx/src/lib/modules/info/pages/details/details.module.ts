import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DetailsComponent } from './details.component';
import { ValveCoreModule } from '../../../core/core.module';

const routes: Routes = [
  {
    path: '',
    component: DetailsComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), ValveCoreModule],
  declarations: [DetailsComponent]
})
export class DetailsModule {}
