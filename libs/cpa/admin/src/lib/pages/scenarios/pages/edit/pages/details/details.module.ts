import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ScenarioCommonModule } from '../../../../common/common.module';
import { DetailsComponent } from './details.component';

const routes: Routes = [
  {
    path: '',
    component: DetailsComponent
  }
];

@NgModule({
  declarations: [DetailsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ScenarioCommonModule]
})
export class DetailsModule {}
